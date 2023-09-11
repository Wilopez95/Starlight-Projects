import Joi from 'joi';

import { THRESHOLD_SETTINGS } from '../../../../consts/thresholdSettings.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../../consts/billingCycles.js';
import { FREQUENCY_TYPES } from '../../../../consts/frequencyTypes.js';
import { SORT_ORDERS } from '../../../../consts/sortOrders.js';
import { RATES_SORTING_ATTRIBUTES } from '../../../../consts/ratesSortingAttributes.js';

const VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];

const id = Joi.number().integer().positive();

export const activeOnly = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
  })
  .required();

export const paginationParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...RATES_SORTING_ATTRIBUTES)
    .optional(),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
});

export const groupTypeFilter = Joi.object()
  .keys({
    type: Joi.string().valid('customerGroup', 'customer', 'customerJobSite', 'serviceArea'),
  })
  .required();

export const filterByIds = Joi.object()
  .keys({
    activeOnly: Joi.boolean().optional(),
    customerGroupId: id,
    customerId: id,
    customerJobSiteId: id,
  })
  .xor('customerGroupId', 'customerId', 'customerJobSiteId')
  .required();

export const customRatesGroupData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    // 4 or 5 types of Price Groups
    customerGroupId: id,
    customerId: id,
    customerJobSiteId: id,
    serviceAreaIds: Joi.array().items(id.required()).allow(null),
    nonServiceHours: Joi.boolean(),

    active: Joi.boolean().required(),
    description: Joi.string().required(),
    startDate: Joi.date().allow(null).required(),
    endDate: Joi.date().allow(null).required(),
    validDays: Joi.array()
      .items(
        Joi.number()
          .integer()
          .valid(...VALID_DAYS)
          .required(),
      )
      .min(1)
      .required(),

    overweightSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .optional(),
    usageDaysSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .optional(),
    demurrageSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .optional(),
    dumpSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .optional(),
    loadSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .optional(),

    spUsed: Joi.boolean().default(false).optional(),
  })
  .xor('customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreaIds')
  .required();

const frequencies = Joi.array().items(
  Joi.object().keys({
    times: Joi.number().integer().positive().allow(null),
    type: Joi.string()
      .valid(...FREQUENCY_TYPES)
      .required()
      .allow(null),
    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .required(),
    price: Joi.number().min(0).allow(null),
  }),
);

const ratesService = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    billableServiceId: id.required(),
    materialId: id.allow(null).required(),
    equipmentItemId: id.required(),

    billingCycle: Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES),

    price: Joi.number().min(0).allow(null),

    frequencies,
  })
  .required();

export const customerGroupRatesServiceData = Joi.array().items(ratesService).min(1).required();

const ratesLineItem = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    lineItemId: id.required(),
    materialId: id.optional(),

    price: Joi.number().min(0).allow(null),

    billingCycles: Joi.array().items(
      Joi.object().keys({
        billingCycle: Joi.string()
          .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
          .required(),

        price: Joi.number().required().allow(null),
      }),
    ),
  })
  .required();

const ratesSurcharge = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    surchargeId: id.required(),
    materialId: id.optional(),

    price: Joi.number().min(0).allow(null),
  })
  .required();

export const customerGroupRatesLineItemData = Joi.array().items(ratesLineItem).min(1).required();

export const customerGroupRatesSurchargeData = Joi.array().items(ratesSurcharge).min(1).required();

const ratesThreshold = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    thresholdId: id.required(),

    equipmentItemId: id.optional(),
    materialId: id.optional(),

    price: Joi.number().min(0).allow(null),
    limit: Joi.number().min(0).allow(null),
  })
  .required();

export const customerGroupRatesThresholdData = Joi.array().items(ratesThreshold).min(1).required();

export const serviceParams = Joi.object()
  .keys({
    billableServiceId: id,
    materialId: id.allow(null),
    equipmentItemId: id,
  })
  .required();

export const lineItemParams = Joi.object()
  .keys({
    lineItemId: id,
    materialId: id.allow(null),
    oneTime: Joi.boolean().allow(null),
  })
  .required();

export const surchargeParams = Joi.object()
  .keys({
    surchargeId: id,
    materialId: id,
  })
  .required();

export const thresholdParams = Joi.object()
  .keys({
    thresholdId: id,
    materialId: Joi.alternatives().try(id, Joi.allow(null)),
    equipmentItemId: Joi.alternatives().try(id, Joi.allow(null)),
  })
  .required();

export const updateThresholdSettingData = Joi.object()
  .keys({
    overweightSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .default(null)
      .required(),
    usageDaysSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .default(null)
      .required(),
    demurrageSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .allow(null)
      .default(null)
      .required(),
  })
  .required();
