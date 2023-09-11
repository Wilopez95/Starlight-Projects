import Joi from 'joi';
import camelCase from 'lodash/fp/camelCase.js';

import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';
import { PRICE_ENTITY_TYPE, PRICE_ENTITY_TYPES } from '../../../consts/priceEntityTypes.js';
import { PRICE_GROUP_TYPES } from '../../../consts/priceGroupFields.js';
import { THRESHOLD_SETTINGS } from '../../../consts/thresholdSettings.js';

import {
  BATCH_RATES_APPLICATIONS,
  BATCH_RATES_SOURCES,
  BATCH_RATES_CALCULATIONS,
  BATCH_UPDATE_TARGETS,
  INCLUDE_NONE_MATERIAL,
  INCLUDE_ALL,
} from '../../../consts/batchRates.js';

const VALID_DAYS = [0, 1, 2, 3, 4, 5, 6];

const id = Joi.number().integer().positive();
const amount = Joi.number().integer().min(10_000).allow(0).required();

const entityType = Joi.string()
  .valid(...PRICE_ENTITY_TYPES.map(camelCase))
  .required();

const setPricesKeys = {
  oneTimeLineItem: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableLineItemId: id.required(),
        materialId: id.allow(null).required(),
        price: amount,
      }),
    )
    .allow(null),
  recurringLineItem: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableLineItemId: id.required(),
        billingCycle: Joi.string()
          .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
          .allow(null),
        price: amount,
      }),
    )
    .allow(null),
  oneTimeService: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableServiceId: id.required(),
        equipmentItemId: id.required(),
        materialId: id.allow(null).required(),
        price: amount,
      }),
    )
    .allow(null),
  recurringService: Joi.array()
    .items(
      Joi.object().keys({
        id,
        billableServiceId: id.required(),
        equipmentItemId: id.required(),
        materialId: id.allow(null).required(),
        billingCycle: Joi.string()
          .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
          .allow(null),
        frequencyId: id,
        price: amount,
      }),
    )
    .allow(null),
  surcharge: Joi.array()
    .items(
      Joi.object().keys({
        id,
        materialId: id.allow(null).required(),
        surchargeId: id.required(),
        price: amount,
      }),
    )
    .allow(null),
  threshold: Joi.array()
    .items(
      Joi.object().keys({
        id,
        thresholdId: id.required(),
        price: amount,
        limit: Joi.number(),
      }),
    )
    .allow(null),
};

export const getGeneralPricesSchema = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  entityType,
});

export const setGeneralPricesSchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    ...setPricesKeys,
  })
  .required();

export const setCustomPricesSchema = Joi.object().keys(setPricesKeys).required();

export const getAllPricesSchema = Joi.object().keys({
  entityType,
});

export const createPriceGroupSchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    customerGroupId: id.optional(),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    serviceAreasIds: Joi.array().items(id.required()).optional(),

    active: Joi.boolean().required(),
    description: Joi.string().required(),
    startAt: Joi.date().allow(null).required(),
    endAt: Joi.date().allow(null).required(),
    nonServiceHours: Joi.boolean(),
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
      .optional(),
    usageDaysSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .optional(),
    demurrageSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .optional(),
    // TODO: should be required
    spUsed: Joi.boolean().optional(),
  })
  .xor('customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreasIds')
  .required();

export const updatePriceGroupSchema = Joi.object()
  .keys({
    customerGroupId: id.optional(),
    customerId: id.optional(),
    customerJobSiteId: id.optional(),
    serviceAreasIds: Joi.array().items(id.required()).optional(),

    active: Joi.boolean().optional(),
    description: Joi.string().optional(),
    startAt: Joi.date().allow(null).required(),
    endAt: Joi.date().allow(null).required(),
    nonServiceHours: Joi.boolean(),
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
      .optional(),
    usageDaysSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .optional(),
    demurrageSetting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .optional(),
    // TODO: should be required
    spUsed: Joi.boolean().optional(),
  })
  .xor('customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreasIds')
  .required();

export const batchUpdateData = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),

  application: Joi.string()
    .valid(...BATCH_RATES_APPLICATIONS)
    .required(),
  target: Joi.string()
    .valid(...BATCH_UPDATE_TARGETS)
    .required(),
  value: Joi.number().required(),
  source: Joi.string()
    .valid(...BATCH_RATES_SOURCES)
    .required(),
  calculation: Joi.string()
    .valid(...BATCH_RATES_CALCULATIONS)
    .required(),

  services: Joi.array()
    .items(Joi.alternatives(id, Joi.string().valid(INCLUDE_ALL)))
    .allow(null),
  lineItems: Joi.array()
    .items(Joi.alternatives(id, Joi.string().valid(INCLUDE_ALL)))
    .allow(null),
  equipmentItems: Joi.array()
    .items(Joi.alternatives(id, Joi.string().valid(INCLUDE_ALL)))
    .allow(null),
  materials: Joi.array()
    .items(Joi.alternatives(id, Joi.string().valid(INCLUDE_NONE_MATERIAL, INCLUDE_ALL)))
    .allow(null),

  applyTo: Joi.array().items(id.required()).required(),

  effectiveDate: Joi.date().default(new Date()),
  overridePrices: Joi.boolean().default(true),
});

export const getPriceGroupsSchema = Joi.object()
  .keys({
    // active only
    activeOnly: Joi.boolean().optional(),
    businessUnitId: id.required(),
    businessLineId: id.required(),
    // pagination params
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    // entity type filter
    type: Joi.string().valid(...PRICE_GROUP_TYPES),
    // filter by ids
    customerGroupId: id,
    customerId: id,
    customerJobSiteId: id,
    serviceAreasIds: Joi.array().items(id.required()),
  })
  .xor('type', 'customerGroupId', 'customerId', 'customerJobSiteId', 'serviceAreasIds')
  .required();

const getPricesHistory = {
  entityType: entityType.required(),
  billableServiceId: Joi.when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.oneTimeService),
        camelCase(PRICE_ENTITY_TYPE.recurringService),
      )
      .required(),
    then: id.required(),
  }),
  materialId: Joi.when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.oneTimeService),
        camelCase(PRICE_ENTITY_TYPE.recurringService),
      )
      .required(),
    then: id.allow(null).required(),
  }).when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.oneTimeLineItem),
        camelCase(PRICE_ENTITY_TYPE.recurringLineItem),
        camelCase(PRICE_ENTITY_TYPE.surcharge),
      )
      .required(),
    then: id.allow(null).required(),
  }),
  equipmentItemId: Joi.when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.oneTimeService),
        camelCase(PRICE_ENTITY_TYPE.recurringService),
      )
      .required(),
    then: id.allow(null).required(),
  }),
  lineItemId: Joi.when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.oneTimeLineItem),
        camelCase(PRICE_ENTITY_TYPE.recurringLineItem),
        camelCase(PRICE_ENTITY_TYPE.surcharge),
      )
      .required(),
    then: id.required(),
  }),
  surchargeId: Joi.when('entityType', {
    is: Joi.string().valid(camelCase(PRICE_ENTITY_TYPE.surcharge)).required(),
    then: id.required(),
  }),
  thresholdId: Joi.when('entityType', {
    is: Joi.string().valid(camelCase(PRICE_ENTITY_TYPE.threshold)).required(),
    then: id.required(),
  }),
  billingCycle: Joi.when('entityType', {
    is: Joi.string()
      .valid(
        camelCase(PRICE_ENTITY_TYPE.recurringService),
        camelCase(PRICE_ENTITY_TYPE.recurringLineItem),
      )
      .required(),
    then: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .required(),
  }),
  frequencyId: Joi.when('entityType', {
    is: Joi.string().valid(camelCase(PRICE_ENTITY_TYPE.recurringService)).required(),
    then: id.allow(null).required(),
  }),
};

export const getCustomPricesHistorySchema = Joi.object().keys(getPricesHistory).required();

export const getGeneralPricesHistorySchema = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    ...getPricesHistory,
  })
  .required();
