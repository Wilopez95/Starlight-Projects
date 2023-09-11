import httpStatus from 'http-status';
import pick from 'lodash/fp/pick.js';
import sumBy from 'lodash/sumBy.js';
import isEmpty from 'lodash/isEmpty.js';

import { calculateSurcharges } from '../../../services/orderSurcharges.js';
import { calcRates } from '../../../services/orderRates.js';
import RecurrentOrderTemplateRepo from '../../../repos/recurrentOrderTemplate.js';
import PhoneNumberRepo from '../../../repos/phoneNumber.js';
import RecurrentOrderTemplateOrderRepo from '../../../repos/recurrentOrderTemplateOrder.js';
import OrderRepo from '../../../repos/order.js';
import CustomerRepo from '../../../repos/customer.js';
import CustomerJobSiteRepo from '../../../repos/customerJobSitePair.js';
import BusinessUnitRepo from '../../../repos/businessUnit.js';

import { validateDates, getNextServiceDate } from '../../../services/recurrentOrder.js';
import { getAvailableCredit } from '../../../services/billing.js';
import {
  createPaymentsForNewOrders,
  // pre-pricing service code
  // prePopulateRecurrentOrdersInput,
  prePopulateRecurrentOrdersInputPricing,
} from '../../../services/billingProcessor.js';

import validateBestTimeToComeRange from '../../../utils/validateBestTimeToComeRange.js';
import { omitPhoneNumberFields } from '../../../utils/dbHelpers.js';
import { parseSearchQuery } from '../../../utils/search.js';
import { checkPermissions } from '../../../middlewares/authorized.js';

import ApiError from '../../../errors/ApiError.js';

import { SORT_ORDER } from '../../../consts/sortOrders.js';
import {
  RECURRENT_TEMPLATE_SORTING_ATTRIBUTE,
  RECURRENT_TEMPLATE_STATUS,
} from '../../../consts/recurrentOrderTemplates.js';
import { PAYMENT_METHOD } from '../../../consts/paymentMethods.js';
import { CUSTOMER_STATUS } from '../../../consts/customerStatuses.js';
import { GENERATED_ORDERS_SORTING_ATTRIBUTE } from '../../../consts/generatedOrdersSortingAttributes.js';
import { cjsPairFields } from '../../../consts/orderFields.js';
import { PERMISSIONS } from '../../../consts/permissions.js';
import {
  pricingAlterRecurrentOrderTemplate,
  pricingDeleteRecurrentOrderTemplate,
  pricingDeleteRecurrentOrderTemplateOrder,
  pricingGetDataForGeneration,
  pricingUpsertRecurrentOrderTemplateLineItems,
  pricingBulkAddRecurrentOrderTemplateOrder,
  pricingDeleteRecurrentOrderTemplateLineItems,
} from '../../../services/pricing.js';
import BillableSurchargeRepository from '../../../repos/billableSurcharge.js';
import { mathRound2 } from '../../../utils/math.js';
import BillableServiceRepository from '../../../repos/billableService.js';
import Contact from '../../../repos/contact.js';
import Material from '../../../repos/material.js';

const getCustomerJobSitePairInputFields = pick(cjsPairFields);

const ITEMS_PER_PAGE = 25;

async function* getAsyncIterator(items) {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
  }
}

export const createRecurrentOrderTemplate = async ctx => {
  const { email, userId, tenantId, schemaName } = ctx.state.user;
  const {
    recurrentTemplateData,
    customerId,
    jobSiteId,
    projectId,
    businessUnitId,
    businessLineId,
    serviceAreaId,
    jobSiteContactId,
    delivery,
    final,
    pair,
    overrideCreditLimit,
    commercialTaxesUsed,
  } = ctx.request.validated.body;

  const [customer, businessUnit, { timeZone }] = await Promise.all([
    CustomerRepo.getInstance(ctx.state).getBy({
      condition: { id: customerId },
      fields: ['id', 'status', 'customerGroupId'],
    }),
    BusinessUnitRepo.getInstance(ctx.state).getBy({ condition: { id: businessUnitId } }),
    BusinessUnitRepo.getInstance(ctx.state).getTimeZone(businessUnitId, tenantId),
  ]);

  if (customer?.status === CUSTOMER_STATUS.inactive) {
    throw ApiError.invalidRequest('Customer is inactive');
  }

  const orders = [];
  if (delivery) {
    orders.push(delivery);
  }
  if (final) {
    orders.push(final);
  }

  const initialServiceDate = getNextServiceDate(
    {
      date: recurrentTemplateData.startDate,
      endDate: recurrentTemplateData.endDate,
      frequencyType: recurrentTemplateData.frequencyType,
      customFrequencyType: recurrentTemplateData?.customFrequencyType,
      frequencyPeriod: recurrentTemplateData?.frequencyPeriod,
      frequencyDays: recurrentTemplateData?.frequencyDays,
      timeZone,
    },
    true,
  );

  validateDates({
    startDate: recurrentTemplateData.startDate,
    endDate: recurrentTemplateData?.endDate,
    deliveryServiceDate: delivery?.serviceDate,
    initialServiceDate,
  });

  const ordersInput = orders.flatMap(order =>
    Array(Number(order.billableServiceQuantity)).fill(order),
  );
  // pre-pricing service code
  // ordersInput.forEach(orderInput => (orderInput.isRollOff = true));
  ordersInput.forEach(orderInput => Object.assign(orderInput, { isRollOff: true }));

  const ordersTotal =
    sumBy(ordersInput, 'grandTotal') +
    recurrentTemplateData.grandTotal * recurrentTemplateData.billableServiceQuantity;

  if (!overrideCreditLimit) {
    const { availableCredit } = await getAvailableCredit(ctx, { customerId });

    if (ordersTotal > 0 && availableCredit < ordersTotal) {
      throw ApiError.paymentRequired('Credit limit exceeded for on account payment');
    }
  } else {
    ordersInput.forEach(order => {
      order.overrideCreditLimit = true;
    });
  }

  const commonData = {
    csrEmail: email,
    businessUnitId,
    businessLineId,
    serviceAreaId,
    customerId,
    jobSiteId,
    projectId,
    jobSiteContactId,
    paymentMethod: PAYMENT_METHOD.onAccount,
    commercialTaxesUsed,
    ...pair,
  };

  validateBestTimeToComeRange(
    recurrentTemplateData.bestTimeToComeFrom,
    recurrentTemplateData.bestTimeToComeTo,
  );
  Object.assign(recurrentTemplateData, commonData);

  orders.forEach(order => {
    validateBestTimeToComeRange(order.bestTimeToComeFrom, order.bestTimeToComeTo);
    Object.assign(order, commonData);
  });

  const recurrentOrderTemplateRepo = RecurrentOrderTemplateRepo.getInstance(ctx.state);
  // const recurrentOrderTemplateOrderRepo = RecurrentOrderTemplateOrderRepo.getInstance(ctx.state);

  const newRecurrentOrderTemplate = await recurrentOrderTemplateRepo.createOne(
    {
      data: recurrentTemplateData,
      log: true,
    },
    ctx,
  );

  const { recurrentOrderTemplate } = await recurrentOrderTemplateRepo.getDataForGeneration(
    {
      condition: { recurrentOrderTemplateId: newRecurrentOrderTemplate.id },
    },
    { skipPricesRefresh: true },
    ctx,
  );

  recurrentOrderTemplate.serviceDate = initialServiceDate;
  recurrentOrderTemplate.createDeferredWorkOrder = false;

  // bcz each order's pair is identical
  const pairData = getCustomerJobSitePairInputFields({ ...pair, customerId, jobSiteId });
  // TODO: solve jobSite2 case bcz it could be different
  const cjsRepo = CustomerJobSiteRepo.getInstance(ctx.state);
  const { linkedCjsPair, created: linkedCjsPairCreated } = await cjsRepo.upsertOne({
    customerId,
    // no jobSiteId - recycling case
    jobSiteId: jobSiteId || businessUnit.jobSiteId,
    data: pairData,
  });

  // const recurrentOrdersInput = Array(Number(recurrentOrderTemplate.billableServiceQuantity)).fill(recurrentOrderTemplate);
  const payments = [
    { paymentMethod: PAYMENT_METHOD.onAccount, amount: ordersTotal, sendReceipt: false },
  ];

  const orderRepo = OrderRepo.getInstance(ctx.state);
  let newOrders;

  try {
    // const [newRecurrentOrders, ...restCreatedOrders] = await Promise.all([
    //   Promise.all(
    //     recurrentOrdersInput.map((order) =>
    //       orderRepo.createOneFromRecurrentOrderTemplate({
    //         data: order,
    //         recurrentOrderTemplateId: newRecurrentOrderTemplate.id,
    //         tenantId,
    //         linkedCjsPair,
    //       }),
    //     ),
    //   ),
    //   ...ordersInput.map((order) => orderRepo.createOne({ data: { ...order, payments }, tenantId, businessUnit, linkedCjsPair })),
    // ]);

    const newRecurrentOrders = [];
    const restCreatedOrders = [];

    const q1 = Number(recurrentOrderTemplate.billableServiceQuantity);
    const createRecurrentOrder = orderRepo.createOneFromRecurrentOrderTemplate.bind(
      orderRepo,
      ctx,
      {
        data: recurrentOrderTemplate,
        recurrentOrderTemplateId: newRecurrentOrderTemplate.id,
        tenantId,
        linkedCjsPair,
      },
    );

    const templates = Array.from({ length: q1 }).fill(recurrentOrderTemplate);
    for await (const o of getAsyncIterator(templates)) {
      const createdRecurrentOrder = await createRecurrentOrder(o);
      newRecurrentOrders.push(createdRecurrentOrder);
    }

    for await (const order of getAsyncIterator(orders)) {
      const q2 = Number(order.billableServiceQuantity);
      // pre-pricing service code:
      // const createOrder = orderRepo.createOne.bind(orderRepo, {
      //   data: { ...order, payments },
      //   tenantId,
      //   businessUnit,
      //   linkedCjsPair,
      // });
      const createOrder = orderRepo.createOne.bind(
        orderRepo,
        { data: { ...order, payments }, tenantId, businessUnit, linkedCjsPair },
        ctx,
      );

      for await (const o of getAsyncIterator(Array.from({ length: q2 }).fill(order))) {
        const createdOrder = await createOrder(o);
        restCreatedOrders.push(createdOrder);
      }
    }

    newOrders = [...newRecurrentOrders, ...restCreatedOrders];

    const recurrentOrderTemplateId = newRecurrentOrderTemplate.id;
    if (restCreatedOrders?.length) {
      // create a bulk insert in pricing backend
      await pricingBulkAddRecurrentOrderTemplateOrder(ctx, {
        data: {
          data: restCreatedOrders.map(({ id }) => ({
            orderId: id,
            recurrentOrderTemplateId,
          })),
        },
      });
      // await recurrentOrderTemplateOrderRepo.insertMany({
      //   data: restCreatedOrders.map(({ id }) => ({
      //     orderId: id,
      //     recurrentOrderTemplateId,
      //   })),
      // });
    }

    // pre-pricing service code:
    // const billingRecurrentOrdersInput = await prePopulateRecurrentOrdersInput(ctx, {
    //   recurrentOrderTemplateId,
    //   ordersInput: Array(Number(recurrentOrderTemplate.billableServiceQuantity)).fill(recurrentOrderTemplate),
    //   schemaName,
    // });
    const billingRecurrentOrdersInput = await prePopulateRecurrentOrdersInputPricing(ctx, {
      recurrentOrderTemplate,
      ordersInput: Array(Number(recurrentOrderTemplate.billableServiceQuantity)).fill(
        recurrentOrderTemplate,
      ),
      schemaName,
    });

    await createPaymentsForNewOrders(ctx, {
      payments,
      customerId,
      ordersInput: ordersInput.concat(billingRecurrentOrdersInput),
      newOrders: newOrders.map(({ insertData, id, woNumber }) => ({
        ...insertData,
        id,
        businessUnitId,
        woNumber,
      })),
      businessUnitId,
      schemaName,
    });

    const currentDate = new Date();

    const nextServiceDate = getNextServiceDate({
      date: initialServiceDate,
      endDate: recurrentOrderTemplate.endDate,
      frequencyType: recurrentOrderTemplate.frequencyType,
      customFrequencyType: recurrentOrderTemplate?.customFrequencyType,
      frequencyPeriod: recurrentOrderTemplate?.frequencyPeriod,
      frequencyDays: recurrentOrderTemplate?.frequencyDays,
      timeZone,
    });

    const templateUpdateData = {
      grandTotal: newOrders[0].grandTotal,
      syncDate: currentDate.toUTCString(),
    };

    if (nextServiceDate) {
      templateUpdateData.nextServiceDate = nextServiceDate;
    }
    // await recurrentOrderTemplateRepo.updateBy({
    //   condition: {
    //     id: newRecurrentOrderTemplate.id,
    //   },
    //   data: templateUpdateData,
    //   log: true,
    // });
    await pricingAlterRecurrentOrderTemplate(
      ctx,
      { data: templateUpdateData },
      newRecurrentOrderTemplate.id,
    );
  } catch (error) {
    // const results = await Promise.allSettled([
    //   recurrentOrderTemplateOrderRepo.deleteBy({
    //     condition: { recurrentOrderTemplateId: newRecurrentOrderTemplate.id },
    //   }),
    //   recurrentOrderTemplateRepo.deleteBy({
    //     condition: { id: newRecurrentOrderTemplate.id },
    //   }),
    //   ...(newOrders?.length
    //     ? newOrders?.map(({ id: orderId, workOrderId }) => orderRepo.deleteOrderAndRelatedEntities({ orderId, workOrderId }))
    //     : []),
    //   linkedCjsPairCreated && linkedCjsPair?.id
    //     ? CustomerJobSiteRepo.getInstance(this.ctxState).deleteBy({ condition: { id: linkedCjsPair.id } })
    //     : Promise.resolve(),
    // ]);
    const results = await Promise.allSettled([
      // pre-pricing service code
      // recurrentOrderTemplateOrderRepo.deleteBy({
      //   condition: { recurrentOrderTemplateId: newRecurrentOrderTemplate.id },
      // }),
      // recurrentOrderTemplateRepo.deleteBy({
      //   condition: { id: newRecurrentOrderTemplate.id },
      // }),
      // ...(newOrders?.length
      //   ? newOrders?.map(({ id: orderId, workOrderId }) =>
      pricingDeleteRecurrentOrderTemplateOrder(ctx, newRecurrentOrderTemplate.id),
      pricingDeleteRecurrentOrderTemplate(ctx, newRecurrentOrderTemplate.id),
      ...(!isEmpty(newOrders)
        ? newOrders.map(({ id: orderId, workOrderId }) =>
            orderRepo.deleteOrderAndRelatedEntities({ orderId, workOrderId }),
          )
        : []),
      linkedCjsPairCreated && linkedCjsPair?.id
        ? CustomerJobSiteRepo.getInstance(ctx.state).deleteBy({
            condition: { id: linkedCjsPair.id },
          })
        : Promise.resolve(),
    ]);

    results.forEach(({ status, reason }) => {
      if (status === 'rejected') {
        ctx.logger.error(reason, `Failed to rollback results of createRecurrentTemplate operation`);
      }
    });

    throw error;
  }

  if (newOrders?.length) {
    const action = orderRepo.logAction.create;
    newOrders.forEach(({ id }) => orderRepo.log({ id, repo: orderRepo, userId, action }));

    if (linkedCjsPairCreated && linkedCjsPair?.id) {
      cjsRepo.log({ id: linkedCjsPair.id, userId, action });
    }
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = { id: newRecurrentOrderTemplate.id, total: newOrders?.length };
};

export const editRecurrentOrderTemplate = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const data = ctx.request.validated.body;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: ['id', 'customerId'],
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  const updatedTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateOne({
    condition: { id },
    concurrentData,
    data: { ...data, customerId: recurrentOrderTemplate.customer?.originalId },
    log: true,
  });

  ctx.sendObj(updatedTemplate);
};

export const editRecurrentOrderTemplatePricing = async ctx => {
  // const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;
  if (!data.customRatesGroupId) {
    data.customRatesGroupId = null;
    data.customRatesGroupServicesId = null;
  }

  const recurrentOrderTemplate = await pricingGetDataForGeneration(ctx, { data: { id } });
  const customerHistoricalData = await CustomerRepo.getHistoricalInstance(ctx.state).getBy({
    condition: { id: recurrentOrderTemplate.customerId },
  });

  const customerData = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: customerHistoricalData.originalId },
  });

  const jobSiteContactHistorical = await Contact.getHistoricalInstance(ctx.state).getRecentBy({
    condition: { originalId: data.jobSiteContactId },
  });

  const orderContactHistorical = await Contact.getHistoricalInstance(ctx.state).getRecentBy({
    condition: { originalId: data.orderContactId },
  });

  const materialHistorical = await Material.getHistoricalInstance(ctx.state).getRecentBy({
    condition: { originalId: data.materialId },
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  let surchargesTotal = 0;
  if (data.applySurcharges) {
    const surcharges = await BillableSurchargeRepository.getInstance(ctx.state).getAll({
      condition: { active: true, businessLineId: data.businessLineId },
    });

    const { customRates, globalRates } = await calcRates(ctx.state, {
      businessUnitId: data.businessUnitId,
      businessLineId: data.businessLineId,
      customRatesGroupId: data.customRatesGroupId,
      type: data.customRatesGroupId ? 'custom' : 'global',
    });

    ({ surchargesTotal } = calculateSurcharges({
      globalRatesSurcharges: globalRates?.globalRatesSurcharges,
      customRatesSurcharges: customRates?.customRatesSurcharges,
      materialId: data.materialId,
      billableServiceId: data.billableServiceId,
      billableServicePrice: data.billableServicePrice,
      billableServiceApplySurcharges: data.billableServiceApplySurcharges,
      lineItems: data.lineItems,
      surcharges,
    }));
  }
  let billableLineItemsTotal = 0;
  if (data.lineItems && data.lineItems.length > 0) {
    data.lineItems.forEach(item => {
      billableLineItemsTotal += item.price * item.quantity;
    });
  }
  billableLineItemsTotal *= Number(data.billableServiceQuantity || 0);
  data.surchargesTotal = surchargesTotal * Number(data.billableServiceQuantity || 0);
  data.billableLineItemsTotal = billableLineItemsTotal;
  data.billableServiceTotal =
    Number(data.billableServicePrice || 0) * Number(data.billableServiceQuantity || 0);
  data.beforeTaxesTotal = mathRound2(data.billableServiceTotal + billableLineItemsTotal);

  const billableServiceHistoricalData = await BillableServiceRepository.getHistoricalInstance(
    ctx.state,
  ).getBy({
    condition: { originalId: data.billableServiceId },
  });

  data.billableServiceId = billableServiceHistoricalData.id;

  Object.assign(recurrentOrderTemplate, data);

  recurrentOrderTemplate.customer = customerData;
  recurrentOrderTemplate.customerId = customerData.id;

  recurrentOrderTemplate.jobSiteContactId = jobSiteContactHistorical.id;
  recurrentOrderTemplate.orderContactId = orderContactHistorical.id;

  recurrentOrderTemplate.materialId = materialHistorical.id;

  const updatedTemplate = await pricingAlterRecurrentOrderTemplate(
    ctx,
    { data: recurrentOrderTemplate },
    id,
  );

  if (!isEmpty(recurrentOrderTemplate.lineItems)) {
    await pricingUpsertRecurrentOrderTemplateLineItems(ctx, {
      data: {
        data: recurrentOrderTemplate.lineItems.map(item =>
          Object.assign(item, { recurrentOrderTemplateId: id }),
        ),
        id,
      },
    });
  } else {
    await pricingDeleteRecurrentOrderTemplateLineItems(ctx, {
      data: { recurrentOrderTemplateId: id },
    });
  }

  ctx.sendObj(updatedTemplate);
};

export const closeRecurrentOrderTemplate = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const notFinalizedCount = await RecurrentOrderTemplateOrderRepo.getInstance(
    ctx.state,
  ).countNotFinalized({
    condition: {
      recurrentOrderTemplateId: id,
    },
  });

  if (notFinalizedCount > 0) {
    throw ApiError.invalidRequest(
      `There are not finalized orders created for the recurrent order.
         Please finalize or cancel them`,
    );
  }

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).closeOne({
    condition: { id },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const putRecurrentTemplateOnHold = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: {
      status: RECURRENT_TEMPLATE_STATUS.onHold,
    },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const putRecurrentTemplateOffHold = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  await RecurrentOrderTemplateRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    data: {
      status: RECURRENT_TEMPLATE_STATUS.active,
    },
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getRecurrentOrderTemplates = async ctx => {
  const {
    customerId,
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.startDate,
    sortOrder = SORT_ORDER.desc,
    query,
  } = ctx.request.validated.query;

  const result = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getAllPaginated({
    condition: { customerId, ...parseSearchQuery(query) },
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(result);
};

export const getRecurrentOrderTemplatesCount = async ctx => {
  const { customerId, query } = ctx.request.validated.query;

  const total = await RecurrentOrderTemplateRepo.getInstance(ctx.state).count({
    condition: { customerId, ...parseSearchQuery(query) },
  });

  ctx.sendObj({ total });
};

export const getRecurrentOrderTemplateViewDetails = async ctx => {
  const { id } = ctx.params;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: [
      ...RecurrentOrderTemplateRepo.getRecurrentOrderTemplateGridFields(),
      'nextServiceDate',
      'lastFailureDate',
      'createdAt',
      'equipmentItemId',
      'driverInstructions',
      'permitId',
      'orderContactId',
      'jobSiteContactId',
      'thirdPartyHaulerId',
      'materialProfileId',
      'customerJobSiteId',
      'projectId',
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
      'someoneOnSite',
      'toRoll',
      'highPriority',
      'earlyPick',
      'purchaseOrderId',
      'billableServicePrice',
      'billableServiceTotal',
      'billableServiceQuantity',
      'billableServiceApplySurcharges',
      'billableLineItemsTotal',
      'beforeTaxesTotal',
      'jobSiteNote',
      'globalRatesServicesId',
      'customRatesGroupId',
      'lineItems',
      'paymentMethod',
      'callOnWayPhoneNumber',
      'textOnWayPhoneNumber',
      'callOnWayPhoneNumberId',
      'textOnWayPhoneNumberId',
      'serviceAreaId',
      'disposalSiteId',
      'applySurcharges',
      'surchargesTotal',
      'unlockOverrides',
      'commercialTaxesUsed',
    ],
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  if (
    recurrentOrderTemplate.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  if (recurrentOrderTemplate.orderContact) {
    const phoneNumbers = await PhoneNumberRepo.getInstance(ctx.state).getAll({
      condition: {
        contactId: recurrentOrderTemplate.orderContact.originalId,
      },
    });
    if (phoneNumbers) {
      recurrentOrderTemplate.orderContact.phoneNumbers = phoneNumbers;
    }
  }

  ctx.sendObj(omitPhoneNumberFields(recurrentOrderTemplate));
};

export const getRecurrentOrderTemplateGeneratedOrders = async ctx => {
  const { id } = ctx.params;

  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    sortBy = GENERATED_ORDERS_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;

  const recurrentOrderTemplate = await RecurrentOrderTemplateRepo.getInstance(ctx.state).getBy({
    condition: { id },
    fields: ['csrEmail'],
  });

  if (!recurrentOrderTemplate) {
    throw ApiError.notFound(`Recurrent order with id ${id} not found`);
  }

  if (
    recurrentOrderTemplate.csrEmail !== ctx.state.user.email &&
    !checkPermissions(ctx.state.user, [PERMISSIONS.ordersViewAll])
  ) {
    throw ApiError.accessDenied('You can only view your own orders');
  }

  const orders = await OrderRepo.getInstance(ctx.state).getAllPaginatedByRecurrentOrderTemplate({
    condition: {
      recurrentOrderTemplateId: id,
    },
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
    sortBy,
    sortOrder,
  });

  ctx.sendArray(orders);
};

export const getCustomerForRecurrentOrder = async ctx => {
  const { customerId } = ctx.request.body;

  let customers = {};
  if (customerId) {
    customers = await CustomerRepo.getHistoricalInstance(ctx.state).getBy({
      condition: { originalId: customerId },
    });
  }

  ctx.sendObj(customers);
};
