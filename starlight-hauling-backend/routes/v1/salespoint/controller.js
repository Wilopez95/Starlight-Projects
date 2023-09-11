import httpStatus from 'http-status';
import pick from 'lodash/pick.js';

import BusinessUnitRepo from '../../../repos/businessUnit.js';
import BusinessLineRepo from '../../../repos/businessLine.js';
import CustomerGroupRepo from '../../../repos/customerGroup.js';
import MerchantRepo from '../../../repos/merchant.js';
import BusinessUnitLineRepo from '../../../repos/businessUnitLine.js';
import MaterialRepo from '../../../repos/material.js';
import EquipmentItemRepo from '../../../repos/equipmentItem.js';
import ServiceAreaRepo from '../../../repos/serviceArea.js';
import GlobalRatesServiceRepo from '../../../repos/globalRatesService.js';
import CustomRatesGroupRepo from '../../../repos/customRatesGroup.js';
import CustomRatesGroupServiceRepo from '../../../repos/customRatesGroupService.js';
import CustomerRepo from '../../../repos/customer.js';
import JobSiteRepo from '../../../repos/jobSite.js';
import OrderRequestRepo from '../../../repos/orderRequest.js';
import BillableServiceRepo from '../../../repos/billableService.js';

import { syncCustomerData } from '../../../services/billingProcessor.js';
import * as billingService from '../../../services/billing.js';
import * as routePlannerPublisher from '../../../services/routePlanner/publishers.js';

import ApiError from '../../../errors/ApiError.js';

import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';

import { CUSTOMER_GROUP_TYPE } from '../../../consts/customerGroups.js';
import { nonCommercialFields, commercialFields } from '../../../consts/customerFields.js';

export const testIntegration = async ctx => {
  const { schemaName, businessUnitId, businessLineId, customerGroupId } = ctx.state.sp;

  const [businessUnit, businessLine, customerGroup] = await Promise.all([
    BusinessUnitRepo.getInstance(ctx.state, { schemaName }).getById({
      id: businessUnitId,
      fields: ['id', 'spUsed', 'merchant_id'],
    }),
    BusinessLineRepo.getInstance(ctx.state, { schemaName })
      .getBy({
        condition: { [`${BusinessLineRepo.TABLE_NAME}.id`]: businessLineId },
        fields: [`${BusinessLineRepo.TABLE_NAME}.id as id`],
      })
      // check for mapped bu-bl relation
      .innerJoin(
        BusinessUnitLineRepo.TABLE_NAME,
        `${BusinessUnitLineRepo.TABLE_NAME}.business_line_id`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      ),
    CustomerGroupRepo.getInstance(ctx.state, { schemaName }).getById({
      id: customerGroupId,
      fields: ['id'],
    }),
  ]);
  // TODO: return errors in body and handle it
  if (!businessUnit || !businessLine || !customerGroup) {
    ctx.status = httpStatus.NOT_FOUND;
    return;
  }
  if (businessUnit.spUsed) {
    ctx.status = httpStatus.CONFLICT;
    return;
  }

  const merchant = await MerchantRepo.getInstance(ctx.state, { schemaName }).getById({
    id: businessUnit.merchantId,
    fields: ['salespointMid', 'salespointUsername', 'salespointPassword'],
  });
  if (!merchant.salespointMid || !merchant.salespointUsername || !merchant.salespointPassword) {
    ctx.status = httpStatus.PAYMENT_REQUIRED;
    return;
  }

  ctx.status = httpStatus.OK;
};

export const confirmIntegration = async ctx => {
  const { schemaName, businessUnitId, businessLineId, customerGroupId } = ctx.state.sp;

  await Promise.all([
    BusinessUnitRepo.getInstance(ctx.state, { schemaName }).updateBy({
      condition: { id: businessUnitId },
      data: {
        spUsed: true,
        spBusinessLineId: businessLineId,
        spCustomerGroupId: customerGroupId,
      },
      fields: ['id'],
    }),
    CustomerGroupRepo.getInstance(ctx.state, { schemaName }).updateBy({
      condition: { id: customerGroupId },
      data: { spUsed: true },
      fields: ['id'],
    }),
    BusinessLineRepo.getInstance(ctx.state, { schemaName }).updateBy({
      condition: { id: businessLineId },
      data: { spUsed: true },
      fields: ['id'],
    }),
  ]);

  ctx.status = httpStatus.OK;
};

export const cancelIntegration = async ctx => {
  const { schemaName, businessUnitId, customerGroupId } = ctx.state.sp;

  const repo = BusinessUnitRepo.getInstance(ctx.state, { schemaName });
  await repo.updateBy({
    condition: { id: businessUnitId },
    data: {
      spUsed: false,
      spBusinessLineId: null,
      spCustomerGroupId: null,
    },
    fields: ['id'],
  });

  const boundBUsToCustomerGroup = await repo.getAll({
    condition: { spUsed: true, spCustomerGroupId: customerGroupId },
    fields: ['id'],
  });
  if (!boundBUsToCustomerGroup?.length) {
    await CustomerGroupRepo.getInstance(ctx.state, { schemaName }).updateBy({
      condition: { id: customerGroupId },
      data: { spUsed: false },
      fields: ['id'],
    });
  }

  ctx.status = httpStatus.OK;
};

export const getMaterialsWithMappedEquipments = async ctx => {
  const { schemaName, businessLineId } = ctx.state.sp;

  const [mappedMaterials, equipmentItems] = await Promise.all([
    // mapped only materials!
    MaterialRepo.getInstance(ctx.state, { schemaName }).getAllPopulatedWithEquipmentItems({
      condition: { businessLineId },
    }),
    EquipmentItemRepo.getInstance(ctx.state, { schemaName }).getAll({
      condition: { businessLineId },
    }),
  ]);

  ctx.sendObj({
    mappedMaterials: mappedMaterials?.filter(({ equipmentItemIds }) => equipmentItemIds.length),
    equipmentItems,
  });
};

export const getServiceAreas = async ctx => {
  const { schemaName, businessUnitId, businessLineId } = ctx.state.sp;

  const serviceAreas = await ServiceAreaRepo.getInstance(ctx.state, { schemaName }).getAll({
    condition: {
      businessUnitId,
      businessLineId,
    },
  });

  ctx.sendArray(serviceAreas);
};

export const getRates = async ctx => {
  const { schemaName, businessUnitId, businessLineId } = ctx.state.sp;

  const [globalRates, priceGroups] = await Promise.all([
    GlobalRatesServiceRepo.getInstance(ctx.state, { schemaName }).getSalesPointRates({
      condition: {
        businessUnitId,
        businessLineId,
      },
      fields: [
        'billableServiceId',
        'materialId',
        `${GlobalRatesServiceRepo.TABLE_NAME}.equipmentItemId as dumpsterId`,
        'price',
      ],
    }),
    CustomRatesGroupRepo.getInstance(ctx.state, { schemaName }).getAllPopulated({
      condition: {
        businessUnitId,
        businessLineId,
        spUsed: true,
      },
      skip: 0,
      limit: 0,
      strictInclude: { serviceArea: true },
    }),
  ]);

  const result = { global: globalRates };

  if (priceGroups?.length) {
    const customRatesGroupIds = [];
    const saToPriceGroupsMap = new Map();

    priceGroups.forEach(pg => {
      customRatesGroupIds.push(pg.id);
      pg.serviceAreaIds.forEach(saId => saToPriceGroupsMap.set(saId, pg.id));
    });

    const customRates = await CustomRatesGroupServiceRepo.getInstance(ctx.state, {
      schemaName,
    }).getSalesPointRates({
      condition: {
        businessUnitId,
        businessLineId,
        customRatesGroupIds,
      },
      fields: [
        'billableServiceId',
        'materialId',
        `${CustomRatesGroupServiceRepo.TABLE_NAME}.equipmentItemId as dumpsterId`,
        'price',
        'customRatesGroupId',
      ],
    });

    result.custom = customRates;

    result.map = [...saToPriceGroupsMap.entries()];
  }

  ctx.sendObj(result);
};

export const createCustomer = async ctx => {
  const { schemaName, tenantId } = ctx.state.sp;
  const { body } = ctx.request.validated;

  const customerGroup = await CustomerGroupRepo.getInstance(ctx.state, { schemaName }).getById({
    id: body.customerGroupId,
    fields: ['type'],
  });

  const commercial = customerGroup.type === CUSTOMER_GROUP_TYPE.commercial;
  const data = commercial ? pick(body, commercialFields) : pick(body, nonCommercialFields);

  data.spUsed = true;
  const newCustomer = await CustomerRepo.getInstance(ctx.state, { schemaName }).createOne({
    data,
    commercial,
    tenantId,
    log: true,
  });

  const { id, mainPhoneNumber } = newCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });

  ctx.status = httpStatus.CREATED;
  ctx.body = { id };
};

export const editCustomer = async ctx => {
  const { schemaName, tenantId } = ctx.state.sp;
  const { id } = ctx.params;
  const { body } = ctx.request.validated;

  const customerGroup = await CustomerGroupRepo.getInstance(ctx.state, { schemaName }).getById({
    id: body.customerGroupId,
    fields: ['type'],
  });

  const commercial = customerGroup.type === CUSTOMER_GROUP_TYPE.commercial;
  const data = commercial ? pick(body, commercialFields) : pick(body, nonCommercialFields);

  const repo = CustomerRepo.getInstance(ctx.state, { schemaName });
  data.contactId = (await repo.getById({ id, fields: ['contactId'] }))?.contactId;

  data.spUsed = true;
  const updatedCustomer = await repo.updateOne({
    condition: { id },
    data,
    commercial,
    tenantId,
    log: true,
  });

  const { mainPhoneNumber } = updatedCustomer;
  await syncCustomerData(ctx, { id, mainPhoneNumber, schemaName });

  ctx.status = httpStatus.OK;
};

export const addCreditCard = async ctx => {
  const { customerId } = ctx.params;
  if (!customerId || customerId === 'null' || customerId === 'undefined') {
    throw ApiError.invalidRequest('Customer id is missed to add new cc');
  }

  const data = ctx.request.validated.body;
  data.active = true;
  data.spUsed = true;

  const cc = await billingService.addCustomerCc(ctx, {
    customerId,
    data,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = cc;
};

export const getCreditCards = async ctx => {
  const { customerId } = ctx.params;

  if (!customerId || customerId === 'null' || customerId === 'undefined') {
    throw ApiError.invalidRequest('Customer id is missed to fetch cc');
  }

  const { ccid: creditCardId } = ctx.request.query;
  const { businessUnitId } = ctx.state.sp;
  const { schemaName } = ctx.state.user;

  const repo = BusinessUnitRepo.getInstance(ctx.state, { schemaName });
  const { merchantId } = await repo.getById({ id: businessUnitId });

  const creditCards = await billingService.getCustomerCc(ctx, {
    customerId,
    spUsedOnly: true,
    creditCardId,
    merchantId,
  });

  ctx.status = httpStatus.OK;
  ctx.body = creditCards;
};

export const createJobSite = async ctx => {
  const { schemaName } = ctx.state.sp;

  const data = ctx.request.validated.body;
  Object.assign(data, { coordinates: data.location.coordinates }, data.address);
  delete data.address;

  const repo = JobSiteRepo.getInstance(ctx.state, { schemaName });

  let jobSite = await repo.checkForDuplicateByCoords(data.location.coordinates);
  if (jobSite?.id) {
    return ctx.sendObj(jobSite);
  }

  jobSite = await repo.createOne({
    data,
    log: true,
  });

  if (jobSite) {
    const jsDataToMq = {
      schemaName,
      id: jobSite.id,
      ...jobSite.address,
    };

    await Promise.all([
      billingService.upsertJobSite(ctx, jsDataToMq),
      routePlannerPublisher.upsertJobSite(ctx, {
        ...jsDataToMq,
        location: jobSite.location,
        coordinates: jobSite.coordinates,
      }),
    ]);
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = jobSite;
  return ctx;
};

export const createOrderRequest = async ctx => {
  const { schemaName } = ctx.state.sp;
  const { customerId, jobSiteId, serviceAreaId, canDetails, totalPrice, paymentDetails } =
    ctx.request.validated.body;

  const total = Number(canDetails.priceEach) * Number(canDetails.quantity);
  if (Number(totalPrice).toFixed(5) !== total.toFixed(5)) {
    throw ApiError.invalidRequest('Total Price does not match with priceEach * quantity');
  }

  const service = await BillableServiceRepo.getInstance(ctx.state, {
    schemaName,
  }).getBy({
    condition: {
      equipmentItemId: canDetails.canTypeId,
      spUsed: true,
    },
  });
  const { id: billableServiceId } = service || {};
  if (!billableServiceId) {
    throw ApiError.notFound('Service not found');
  }

  const paymentMethod = PAYMENT_METHOD.creditCard;
  const data = {
    contractorId: -1,
    customerId,
    jobSiteId,
    serviceAreaId,

    billableServiceId,
    equipmentItemId: canDetails.canTypeId,
    materialId: canDetails.materialTypeId,

    serviceDate: canDetails.scheduledDate,

    billableServicePrice: Number(canDetails.priceEach),
    billableServiceQuantity: Number(canDetails.quantity),
    billableServiceTotal: total,

    initialGrandTotal: total,
    grandTotal: total,

    mediaUrls: Array.isArray(canDetails.mediaUrls) ? canDetails.mediaUrls : [],
    driverInstructions: canDetails.placementInstructions || null,
    alleyPlacement: !!canDetails.alleyPlacement,
    someoneOnSite: !!canDetails.someoneOnSite,

    paymentMethod,
    creditCardId: paymentDetails.cardId || null,
  };

  const result = await OrderRequestRepo.getInstance(ctx.state, { schemaName }).createOne({
    data,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = result;
};

export const fetchOrderRequests = async ctx => {
  const { schemaName } = ctx.state.sp;
  const { ids } = ctx.request.body;
  if (!ids?.length) {
    throw ApiError.invalidRequest('No ids passed to fetch ORs');
  }

  const items = await OrderRequestRepo.getInstance(ctx.state, {
    schemaName,
  }).getAllByIds({ ids, fields: ['id', 'status'] });

  ctx.sendArray(items);
};
