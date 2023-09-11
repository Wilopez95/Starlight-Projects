import httpStatus from 'http-status';

import GlobalRatesServiceRepo from '../../../../repos/globalRatesService.js';
import GlobalRatesRecurringServiceRepo from '../../../../repos/globalRateRecurringService.js';
import GlobalRatesLineItemRepo from '../../../../repos/globalRatesLineItem.js';
import GlobalRatesSurchargeRepo from '../../../../repos/globalRatesSurcharge.js';

import GlobalRatesRecurringLineItemRepo from '../../../../repos/globalRateRecurringLineItem.js';
import GlobalRatesThresholdRepo from '../../../../repos/globalRatesThreshold.js';
import GlobalThresholdsSettingRepository from '../../../../repos/globalThresholdsSetting.js';

export const getGlobalRatesServices = async ctx => {
  const { billableServiceId, materialId, equipmentItemId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  billableServiceId && (condition.billableServiceId = billableServiceId);
  condition.materialId = materialId || null;
  equipmentItemId && (condition.equipmentItemId = equipmentItemId);

  const rates = await GlobalRatesServiceRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const setGlobalRatesServices = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  ctx.logger.debug(concurrentData, 'setGlobalRatesServicesCtrl->concurrentData');
  ctx.logger.debug(data, 'setGlobalRatesServicesCtrl->data');

  await GlobalRatesServiceRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getGlobalRatesRecurringServices = async ctx => {
  const { billableServiceId, materialId, equipmentItemId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  billableServiceId && (condition.billableServiceId = billableServiceId);
  condition.materialId = materialId;
  equipmentItemId && (condition.equipmentItemId = equipmentItemId);

  const rates = await GlobalRatesRecurringServiceRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const setGlobalRatesRecurringServices = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  ctx.logger.debug(concurrentData, 'setGlobalRatesRecurringServicesCtrl->concurrentData');
  ctx.logger.debug(data, 'setGlobalRatesRecurringServicesCtrl->data');

  await GlobalRatesRecurringServiceRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
  });

  ctx.status = httpStatus.OK;
};

export const getGlobalRatesLineItems = async ctx => {
  const { lineItemId, materialId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  lineItemId && (condition.lineItemId = lineItemId);
  condition.materialId = materialId || null;

  const rates = await GlobalRatesLineItemRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const getGlobalRatesSurcharges = async ctx => {
  const { surchargeId, materialId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  surchargeId && (condition.surchargeId = surchargeId);
  condition.materialId = materialId || null;

  const rates = await GlobalRatesSurchargeRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const getGlobalRatesSurchargesBy = async ctx => {
  const { businessUnitId, businessLineId } = ctx.request.body;
  const rates = await GlobalRatesSurchargeRepo.getInstance(ctx.state).getAll({
    condition: { businessUnitId, businessLineId },
  });

  ctx.sendArray(rates);
};

export const setGlobalRatesSurcharges = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  await GlobalRatesSurchargeRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const setGlobalRatesLineItems = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  await GlobalRatesLineItemRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getGlobalRatesRecurringLineItems = async ctx => {
  const { lineItemId } = ctx.request.validated.query;
  const condition = ctx.getRequestCondition();
  lineItemId && (condition.lineItemId = lineItemId);

  const rates = await GlobalRatesRecurringLineItemRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(rates);
};

export const setGlobalRatesRecurringLineItems = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  ctx.logger.debug(concurrentData, 'setGlobalRatesRecurringLineItemsCtrl->concurrentData');
  ctx.logger.debug(data, 'setGlobalRatesRecurringLineItemsCtrl->data');

  await GlobalRatesRecurringLineItemRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
  });

  ctx.status = httpStatus.OK;
};

export const getGlobalRatesThresholds = async ctx => {
  const { thresholdId, materialId, equipmentItemId } = ctx.request.validated.query;

  const condition = ctx.getRequestCondition();
  condition.materialId = materialId || null;
  condition.equipmentItemId = equipmentItemId || null;

  thresholdId && (condition.thresholdId = thresholdId);

  const thresholds = await GlobalRatesThresholdRepo.getInstance(ctx.state).getAll({
    condition,
  });

  ctx.sendArray(thresholds);
};

export const setGlobalRatesThresholds = async ctx => {
  const { concurrentData } = ctx.state;
  const data = ctx.request.validated.body;

  await GlobalRatesThresholdRepo.getInstance(ctx.state).upsertMany({
    data,
    concurrentData,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const getGlobalThresholdsSetting = async ctx => {
  const { thresholdId } = ctx.params;
  const condition = ctx.getRequestCondition();
  condition.thresholdId = thresholdId;

  const setting = await GlobalThresholdsSettingRepository.getInstance(ctx.state).getBy({
    condition,
  });

  ctx.sendObj(setting, httpStatus.NO_CONTENT);
};

export const setGlobalThresholdsSetting = async ctx => {
  const { concurrentData } = ctx.state;
  const { thresholdId } = ctx.params;
  const data = ctx.request.validated.body;
  data.thresholdId = thresholdId;

  const setting = await GlobalThresholdsSettingRepository.getInstance(ctx.state).upsert({
    data,
    concurrentData,
    log: true,
  });

  ctx.sendObj(setting);
};
