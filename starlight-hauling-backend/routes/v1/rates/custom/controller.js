import httpStatus from 'http-status';
import omit from 'lodash/omit.js';
import intersection from 'lodash/intersection.js';

import CustomRatesGroupRepo from '../../../../repos/customRatesGroup.js';
import CustomRatesGroupServiceRepo from '../../../../repos/customRatesGroupService.js';
import CustomRatesGroupLineItemRepo from '../../../../repos/customRatesGroupLineItem.js';
import CustomRatesGroupThresholdRepo from '../../../../repos/customRatesGroupThreshold.js';
import CustomRatesGroupSurchargeRepo from '../../../../repos/customRatesGroupSurcharge.js';

import ApiError from '../../../../errors/ApiError.js';
import { RATES_SORTING_ATTRIBUTE } from '../../../../consts/ratesSortingAttributes.js';
import { SORT_ORDER } from '../../../../consts/sortOrders.js';

const ITEMS_PER_PAGE = 25;

const mapDuplicatedNestedItems = (items, input) =>
  items.map(i => ({
    ...omit(i, ['id']),
    businessUnitId: input.businessUnitId,
    businessLineId: input.businessLineId,
  }));

const mapDuplicatedItemsWithBULoB = (items, input) =>
  items.map(i => ({
    ...i,
    businessUnitId: input.businessUnitId,
    businessLineId: input.businessLineId,
  }));

export const getCustomRatesGroup = async ctx => {
  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    activeOnly = false,
    type,
  } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  if (activeOnly) {
    condition.active = true;
  }

  const strictInclude = {};
  if (type) {
    switch (type) {
      case 'customerGroup':
        strictInclude.customerGroup = true;
        break;
      case 'customer':
        strictInclude.customer = true;
        break;
      case 'customerJobSite':
        strictInclude.customerJobSite = true;
        break;
      case 'serviceArea':
        strictInclude.serviceArea = true;
        break;
      default:
        break;
    }
  }

  const customRatesGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getAllPopulated({
    condition,
    strictInclude,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
  });

  ctx.sendArray(customRatesGroups);
};

export const getSpecificCustomRatesGroups = async ctx => {
  const {
    skip = 0,
    limit = ITEMS_PER_PAGE,
    activeOnly,
    customerGroupId,
    customerId,
    customerJobSiteId,
    sortBy = RATES_SORTING_ATTRIBUTE.status,
    sortOrder = SORT_ORDER.desc,
  } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  if (activeOnly) {
    condition.active = true;
  }

  const strictInclude = {};
  if (customerGroupId) {
    strictInclude.customerGroup = true;
    condition.customerGroupId = customerGroupId;
  } else if (customerId) {
    strictInclude.customer = true;
    condition.customerId = customerId;
  } else if (customerJobSiteId) {
    strictInclude.customerJobSite = true;
    condition.customerJobSiteId = customerJobSiteId;
  }

  const customRatesGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getAllPopulated({
    condition,
    strictInclude,
    sortBy,
    sortOrder,
    skip: Number(skip),
    limit: Math.min(Number(limit), ITEMS_PER_PAGE),
  });

  ctx.sendArray(customRatesGroups);
};

export const getCustomRatesGroupById = async ctx => {
  const { id } = ctx.params;

  const customRatesGroup = await CustomRatesGroupRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.sendObj(customRatesGroup);
};

const checkPriceGroups = async (
  ctx,
  { businessUnitId, businessLineId, serviceAreaIds },
  currentPriceGroupId,
) => {
  const existingSpPriceGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getAllPopulated({
    condition: {
      businessUnitId,
      businessLineId,
      spUsed: true,
    },
    skip: 0,
    limit: 0,
    strictInclude: { serviceArea: true },
  });

  if (existingSpPriceGroups.length >= 1) {
    const exists = existingSpPriceGroups
      .filter(item => String(item.id) !== String(currentPriceGroupId))
      .some(item => intersection(serviceAreaIds, item.serviceAreaIds).length > 0);

    if (exists) {
      throw ApiError.invalidRequest(
        'Only one Price Group can be marked for SP usage for specific Service Area',
      );
    }
  }
};

export const createCustomRatesGroup = async ctx => {
  const data = ctx.request.validated.body;

  if (data.serviceAreaIds?.length > 0 && data.spUsed) {
    await checkPriceGroups(ctx, data);
  }

  const newCustomRatesGroup = await CustomRatesGroupRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  ctx.status = httpStatus.CREATED;
  ctx.body = newCustomRatesGroup;
};

export const editCustomRatesGroup = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const data = ctx.request.validated.body;

  data.customerGroupId = data.customerGroupId || null;
  data.customerId = data.customerId || null;
  data.customerJobSiteId = data.customerJobSiteId || null;
  data.serviceAreaIds = data.serviceAreaIds || data.serviceAreaIds?.length || null;

  ctx.logger.debug(`editCustomRatesGroupCtrl->id: ${id}`);
  ctx.logger.debug(concurrentData, 'editCustomRatesGroupCtrl->concurrentData');
  ctx.logger.debug(data, 'editCustomRatesGroupCtrl->data');

  if (data.serviceAreaIds?.length > 0 && data.spUsed) {
    await checkPriceGroups(ctx, data, id);
  }

  await CustomRatesGroupRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data,
    log: true,
  });

  const updatedCustomRatesGroup = await CustomRatesGroupRepo.getInstance(ctx.state).getBy({
    condition: { id },
  });

  ctx.logger.debug(updatedCustomRatesGroup, 'editCustomRatesGroupCtrl->updatedCustomRatesGroup');

  ctx.sendObj(updatedCustomRatesGroup);
};

export const updateCustomRatesGroupThresholdSetting = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;

  const updatedCustomRatesGroup = await CustomRatesGroupRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    data: ctx.request.validated.body,
    log: true,
  });

  ctx.sendObj(updatedCustomRatesGroup);
};

export const deleteCustomRatesGroup = async ctx => {
  const { id } = ctx.params;

  await CustomRatesGroupRepo.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const duplicateCustomRatesGroup = async ctx => {
  const { id: customRatesGroupId } = ctx.params;
  const data = ctx.request.validated.body;

  const newCustomRatesGroup = await CustomRatesGroupRepo.getInstance(ctx.state).createOne({
    data,
    log: true,
  });

  const serviceRatesRepo = CustomRatesGroupServiceRepo.getInstance(ctx.state);
  const lineItemRatesRepo = CustomRatesGroupLineItemRepo.getInstance(ctx.state);
  const thresholdRatesRepo = CustomRatesGroupThresholdRepo.getInstance(ctx.state);
  const surchargeRatesRepo = CustomRatesGroupSurchargeRepo.getInstance(ctx.state);

  const condition = { customRatesGroupId };

  const [serviceRates, lineItemRates, thresholdRates, surchargeRates] = await Promise.all([
    serviceRatesRepo.getAll({ condition }),
    lineItemRatesRepo.getAll({ condition }),
    thresholdRatesRepo.getAll({ condition }),
    surchargeRatesRepo.getAll({ condition }),
  ]);

  condition.customRatesGroupId = newCustomRatesGroup.id;
  condition.businessUnitId = data.businessUnitId;
  condition.businessLineId = data.businessLineId;

  await Promise.all([
    serviceRates?.length
      ? serviceRatesRepo.upsertMany({
          condition,
          data: mapDuplicatedItemsWithBULoB(serviceRates, data),
          duplicate: true,
          log: true,
        })
      : Promise.resolve(),
    lineItemRates?.length
      ? lineItemRatesRepo.upsertMany({
          condition,
          data: mapDuplicatedNestedItems(lineItemRates, data),
          log: true,
        })
      : Promise.resolve(),
    thresholdRates?.length
      ? thresholdRatesRepo.upsertMany({
          condition,
          data: mapDuplicatedNestedItems(thresholdRates, data),
          log: true,
        })
      : Promise.resolve(),
    surchargeRates?.length
      ? surchargeRatesRepo.upsertMany({
          condition,
          data: mapDuplicatedNestedItems(surchargeRates, data),
          log: true,
        })
      : Promise.resolve(),
  ]);

  ctx.status = httpStatus.CREATED;
  ctx.body = newCustomRatesGroup;
};

export const getCustomRatesGroupServices = async ctx => {
  const { id: customRatesGroupId } = ctx.params;
  const { billableServiceId, materialId, equipmentItemId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.customRatesGroupId = customRatesGroupId;

  billableServiceId && (condition.billableServiceId = billableServiceId);
  condition.materialId = materialId || null;
  equipmentItemId && (condition.equipmentItemId = equipmentItemId);

  const rates = await CustomRatesGroupServiceRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const setCustomRatesGroupServices = async ctx => {
  const { concurrentData } = ctx.state;
  const customRatesGroupId = Number(ctx.params.id);
  const data = ctx.request.validated.body;

  ctx.logger.debug(`setCustomRatesGroupServicesCtrl->customRatesGroupId: ${customRatesGroupId}`);
  ctx.logger.debug(concurrentData, 'setCustomRatesGroupServicesCtrl->concurrentData');
  ctx.logger.debug(data, 'setCustomRatesGroupServicesCtrl->data');

  await CustomRatesGroupServiceRepo.getInstance(ctx.state).upsertMany({
    condition: { customRatesGroupId },
    concurrentData,
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getCustomRatesGroupLineItems = async ctx => {
  const { id: customRatesGroupId } = ctx.params;
  const { lineItemId, materialId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.customRatesGroupId = customRatesGroupId;

  lineItemId && (condition.lineItemId = lineItemId);
  condition.materialId = materialId || null;

  if ('oneTime' in ctx.request.validated.query) {
    condition.oneTime = ctx.request.validated.query.oneTime;
  }

  const rates = await CustomRatesGroupLineItemRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const setCustomRatesGroupLineItems = async ctx => {
  const { concurrentData } = ctx.state;
  const customRatesGroupId = Number(ctx.params.id);
  const data = ctx.request.validated.body;

  ctx.logger.debug(`setCustomRatesGroupLineItemsCtrl->customRatesGroupId: ${customRatesGroupId}`);
  ctx.logger.debug(concurrentData, 'setCustomRatesGroupLineItemsCtrl->concurrentData');
  ctx.logger.debug(data, 'setCustomRatesGroupLineItemsCtrl->data');

  await CustomRatesGroupLineItemRepo.getInstance(ctx.state).upsertMany({
    condition: { customRatesGroupId },
    concurrentData,
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

// pre-pricing service diff https://d.pr/i/sUzyJu
export const getCustomRatesGroupSurchargesBy = async ctx => {
  const { businessUnitId, businessLineId, customRatesGroupId } = ctx.request.body;

  const rates = await CustomRatesGroupSurchargeRepo.getInstance(ctx.state).getAll({
    condition: { businessUnitId, businessLineId, customRatesGroupId },
  });

  ctx.sendArray(rates);
};

export const getCustomRatesGroupSurcharges = async ctx => {
  const { id: customRatesGroupId } = ctx.params;
  const { surchargeId, materialId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.customRatesGroupId = customRatesGroupId;
  condition.materialId = materialId || null;

  surchargeId && (condition.surchargeId = surchargeId);

  const rates = await CustomRatesGroupSurchargeRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const getCustomRatesGroupThresholds = async ctx => {
  const { id: customRatesGroupId } = ctx.params;
  const { thresholdId, materialId, equipmentItemId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.customRatesGroupId = customRatesGroupId;

  condition.materialId = materialId || null;
  condition.equipmentItemId = equipmentItemId || null;

  thresholdId && (condition.thresholdId = thresholdId);

  const thresholds = await CustomRatesGroupThresholdRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(thresholds);
};

export const setCustomRatesGroupSurcharges = async ctx => {
  const { concurrentData } = ctx.state;
  const customRatesGroupId = Number(ctx.params.id);
  const data = ctx.request.validated.body;

  await CustomRatesGroupSurchargeRepo.getInstance(ctx.state).upsertMany({
    condition: { customRatesGroupId },
    concurrentData,
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const setCustomRatesGroupThresholds = async ctx => {
  const { concurrentData } = ctx.state;
  const customRatesGroupId = Number(ctx.params.id);
  const data = ctx.request.validated.body;

  await CustomRatesGroupThresholdRepo.getInstance(ctx.state).upsertMany({
    condition: { customRatesGroupId },
    concurrentData,
    data,
    log: true,
  });

  ctx.status = httpStatus.OK;
};
