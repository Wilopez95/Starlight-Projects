import httpStatus from 'http-status';
import isEmpty from 'lodash/isEmpty.js';

import CustomerRepo from '../../../repos/customer.js';
import CustomRatesGroupRepo from '../../../repos/customRatesGroup.js';

import RatesRepository from '../../../repos/_rates.js';
import GlobalRatesServiceRepository from '../../../repos/globalRatesService.js';
import GlobalRatesLineItemRepository from '../../../repos/globalRatesLineItem.js';
import GlobalRateRecServiceFrequencyRepo from '../../../repos/globalRateRecurringServiceFrequency.js';
import GlobalRateRecLineItemBillingCycleRepo from '../../../repos/globalRateRecurringLineItemBillingCycle.js';
import CustomRatesGroupRecServiceFrequencyRepo from '../../../repos/customRatesGroupRecurringServiceFrequency.js';
import CustomRatesGroupRecLineItemBillingCycleRepo from '../../../repos/customRatesGroupRecurringLineItemBillingCycle.js';

import GlobalRatesSurchargeRepository from '../../../repos/globalRatesSurcharge.js';
import GlobalRatesThresholdRepository from '../../../repos/globalRatesThreshold.js';
import GlobalThresholdsSettingRepository from '../../../repos/globalThresholdsSetting.js';
import CustomRatesGroupServiceRepository from '../../../repos/customRatesGroupService.js';
import CustomRatesGroupLineItemRepository from '../../../repos/customRatesGroupLineItem.js';
import CustomRatesGroupSurchargeRepository from '../../../repos/customRatesGroupSurcharge.js';
import CustomRatesGroupThresholdRepository from '../../../repos/customRatesGroupThreshold.js';

import { calcRates as calcOrderRates } from '../../../services/orderRates.js';

import ApiError from '../../../errors/ApiError.js';

import { RATES_ENTITY_TYPE } from '../../../consts/ratesEntityTypes.js';

export const selectRatesGroup = async ctx => {
  const data = ctx.request.validated.body;
  const { customerId, customerJobSiteId, serviceAreaId } = data;

  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: customerId },
    fields: ['customerGroupId'],
  });

  if (!customer) {
    throw ApiError.notFound('Customer not found', `Customer doesn't exist with id ${customerId}`);
  }

  const { customerGroupId } = customer;
  const customRatesGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getActiveRatesGroups({
    condition: { ...data, customerGroupId },
    fields: ['*'],
  });

  if (!isEmpty(customRatesGroups)) {
    let customRatesGroup;
    if (customerJobSiteId) {
      customRatesGroup = customRatesGroups.find(
        item => customerJobSiteId === item.customerJobSiteId,
      );
    }
    if (!customRatesGroup && customerId) {
      customRatesGroup = customRatesGroups.find(item => customerId === item.customerId);
    }
    if (!customRatesGroup && serviceAreaId) {
      customRatesGroup = customRatesGroups.find(item => serviceAreaId === item.serviceAreaId);
    }
    if (!customRatesGroup && customerGroupId) {
      customRatesGroup = customRatesGroups.find(item => customerGroupId === item.customerGroupId);
    }

    if (customRatesGroup) {
      return ctx.sendObj({
        level: 'custom',
        customRatesGroups,
        selectedId: customRatesGroup.id,
      });
    }
  }

  ctx.sendObj({ level: 'global' });
  return null;
};
export const selectRatesGroupRecurrentOrder = async ctx => {
  const data = ctx.request.validated.body;
  const { customerId, customerJobSiteId, serviceAreaId, customRateGroupId } = data;

  const customer = await CustomerRepo.getInstance(ctx.state).getBy({
    condition: { id: customerId },
    fields: ['customerGroupId'],
  });

  if (!customer) {
    throw ApiError.notFound('Customer not found', `Customer doesn't exist with id ${customerId}`);
  }

  const { customerGroupId } = customer;
  const customRatesGroups = await CustomRatesGroupRepo.getInstance(ctx.state).getActiveRatesGroups({
    condition: { ...data, customerGroupId },
    fields: ['*'],
  });

  if (!isEmpty(customRatesGroups)) {
    let customRatesGroup;
    if (customerJobSiteId) {
      customRatesGroup = customRatesGroups.find(
        item => customerJobSiteId === item.customerJobSiteId,
      );
    }
    if (!customRatesGroup && customerId) {
      customRatesGroup = customRatesGroups.find(item => customerId === item.customerId);
    }
    if (!customRatesGroup && serviceAreaId) {
      customRatesGroup = customRatesGroups.find(item => serviceAreaId === item.serviceAreaId);
    }
    if (!customRatesGroup && customerGroupId) {
      customRatesGroup = customRatesGroups.find(item => customerGroupId === item.customerGroupId);
    }

    if (customRatesGroup) {
      return ctx.sendObj({
        level: 'custom',
        customRatesGroups,
        selectedId: customRateGroupId ? customRatesGroup.id : 0,
      });
    }
  }
  ctx.sendObj({ level: 'global' });
  return null;
};

export const calcRates = async ctx => {
  const condition = ctx.getRequestCondition();

  const ratesObj = await calcOrderRates(
    ctx.state,
    Object.assign(condition, ctx.request.validated.body),
  );

  ctx.sendObj(ratesObj);
};

export const getRateLinkedItems = async ctx => {
  const condition = ctx.getRequestCondition();

  const result = await CustomRatesGroupRepo.getInstance(ctx.state).getRateLinkedItems({
    condition,
  });

  ctx.sendObj(result);
};

export const getBatchUpdateTargetRateGroups = async ctx => {
  const { application, applyTo, businessLineId, businessUnitId } = ctx.request.validated.body;

  const result = await CustomRatesGroupRepo.getInstance(ctx.state).getBatchUpdateTargetRateGroups({
    condition: {
      businessUnitId,
      businessLineId,
    },
    application,
    applyTo,
  });

  ctx.sendArray(result);
};

export const batchRatesUpdate = async ctx => {
  const data = ctx.request.validated.body;

  ctx.logger.debug(data, 'batchRatesUpdateCtrl->data');

  const result =
    (await CustomRatesGroupRepo.getInstance(ctx.state).batchRatesUpdate(data, undefined, {
      log: true,
    })) || {};

  ctx.status = httpStatus.OK;
  ctx.body = result;
};

export const getHistoricalRates = async ctx => {
  const { schemaName } = ctx.state.user;
  const { entityType, skip, limit, ...condition } = ctx.request.query;

  const obj = {};
  let recurringRatesRepo;
  switch (entityType) {
    case RATES_ENTITY_TYPE.globalRatesServices: {
      obj.tableName = GlobalRatesServiceRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.globalRatesLineItems: {
      obj.tableName = GlobalRatesLineItemRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.globalRatesSurcharges: {
      obj.tableName = GlobalRatesSurchargeRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.globalRatesThresholds: {
      obj.tableName = GlobalRatesThresholdRepository.getHistoricalTableName();
      obj.attributes = ['limit', 'price'];
      break;
    }
    case RATES_ENTITY_TYPE.globalThresholdsSetting: {
      obj.tableName = GlobalThresholdsSettingRepository.getHistoricalTableName();
      obj.attributes = ['setting'];
      break;
    }
    case RATES_ENTITY_TYPE.customRatesServices: {
      obj.tableName = CustomRatesGroupServiceRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.customRatesLineItems: {
      obj.tableName = CustomRatesGroupLineItemRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.customRatesSurcharges: {
      obj.tableName = CustomRatesGroupSurchargeRepository.getHistoricalTableName();
      obj.attributes = ['price'];
      break;
    }
    case RATES_ENTITY_TYPE.customRatesThresholds: {
      obj.tableName = CustomRatesGroupThresholdRepository.getHistoricalTableName();
      obj.attributes = ['limit', 'price'];
      break;
    }
    case RATES_ENTITY_TYPE.customThresholdsSetting: {
      obj.tableName = CustomRatesGroupRepo.getHistoricalTableName();
      obj.attributes = [
        'overweightSetting',
        'usageDaysSetting',
        'demurrageSetting',
        'loadSetting',
        'dumpSetting',
      ];
      condition.originalId = condition.customRatesGroupId;
      delete condition.customRatesGroupId;
      break;
    }
    case RATES_ENTITY_TYPE.globalRatesRecurringServices: {
      recurringRatesRepo = GlobalRateRecServiceFrequencyRepo.getInstance(ctx.state);
      break;
    }
    case RATES_ENTITY_TYPE.globalRatesRecurringLineItems: {
      recurringRatesRepo = GlobalRateRecLineItemBillingCycleRepo.getInstance(ctx.state);
      break;
    }
    case RATES_ENTITY_TYPE.customRatesRecurringServices: {
      recurringRatesRepo = CustomRatesGroupRecServiceFrequencyRepo.getInstance(ctx.state);
      break;
    }
    case RATES_ENTITY_TYPE.customRatesRecurringLineItems: {
      recurringRatesRepo = CustomRatesGroupRecLineItemBillingCycleRepo.getInstance(ctx.state);
      break;
    }
    default: {
      break;
    }
  }

  let results = [];
  if (!isEmpty(obj)) {
    results = await RatesRepository.getHistoricalRecords(
      { schemaName, condition, skip, limit, ...obj },
      entityType !== RATES_ENTITY_TYPE.globalThresholdsSetting &&
        entityType !== RATES_ENTITY_TYPE.customThresholdsSetting,
      ctx,
    );
  }

  if (recurringRatesRepo) {
    const historicalRecords = await recurringRatesRepo.getHistoricalRecords({ condition });
    // check price changes
    // historicalRecords sorted from newest to oldest
    results = historicalRecords?.reduce((res, item, idx) => {
      const previousPrice = historicalRecords?.[idx + 1]?.price || null;
      if (item.price !== previousPrice) {
        res.push({
          userId: item.userId,
          attribute: 'price',
          timestamp: item.createdAt,
          newValue: item.price,
          previousValue: previousPrice,
        });
      }
      return res;
    }, []);
  }

  ctx.sendArray(results);
};
