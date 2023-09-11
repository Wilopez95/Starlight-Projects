import Joi from 'joi';

import {
  BATCH_RATES_APPLICATIONS,
  BATCH_RATES_SOURCES,
  BATCH_RATES_CALCULATIONS,
  BATCH_UPDATE_TARGETS,
  INCLUDE_NONE_MATERIAL,
  INCLUDE_ALL,
} from '../../../consts/batchRates.js';

import { RATES_ENTITY_TYPES, RATES_ENTITY_TYPE } from '../../../consts/ratesEntityTypes.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../consts/billingCycles.js';

const id = Joi.number().integer().positive();
const arrayIds = Joi.array().items(id.required()).min(1);

export const selectRatesParams = Joi.object()
  .keys({
    businessUnitId: id.allow(null),
    businessLineId: id.allow(null),

    customerId: id.required(),
    customerJobSiteId: id.required().allow(null),
    serviceAreaId: id.allow(null),

    serviceDate: Joi.date().required(),
    customRateGroupId: Joi.number().optional().allow(null),
  })
  .required();

export const calcRatesParams = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),

  type: Joi.string().valid('global', 'custom').required(),
  customRatesGroupId: Joi.when('type', {
    is: 'custom',
    then: id.required(),
  }),

  billableService: Joi.object().keys({
    billableServiceId: id,
    equipmentItemId: Joi.when('billableServiceId', {
      is: id.required(),
      then: id.required(),
    }),
    materialId: Joi.when('billableServiceId', {
      is: id.required(),
      then: id.required().allow(null),
    }),
  }),

  billableLineItems: Joi.array().items(
    Joi.object()
      .keys({
        lineItemId: id.required(),
        materialId: id.allow(null).default(null),
      })
      .required(),
  ),

  billableServiceIds: arrayIds,
  recurringLineItemIds: arrayIds,
  billingCycle: Joi.when('recurringLineItemIds', {
    is: arrayIds.required(),
    then: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .required(),
  }),
  applySurcharges: Joi.boolean().optional(),
});

export const batchUpdateTargetData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    application: Joi.string()
      .valid(...BATCH_RATES_APPLICATIONS)
      .required(),
    applyTo: Joi.array().items(id.required()).required(),
  })
  .required();

export const batchUpdateData = Joi.object()
  .keys({
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
    overrideUpdates: Joi.boolean(),
    checkPendingUpdates: Joi.boolean(),
  })
  .required();

export const historicalRates = Joi.object()
  .keys({
    entityType: Joi.string()
      .valid(...RATES_ENTITY_TYPES)
      .required(),

    businessUnitId: id.required(),
    businessLineId: id.required(),

    // skip: Joi.number().integer().positive().allow(0),
    // limit: Joi.number().integer().positive(),

    billableServiceId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesServices,
          RATES_ENTITY_TYPE.customRatesServices,
          RATES_ENTITY_TYPE.globalRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
        )
        .required(),
      then: id.required(),
    }),
    materialId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesServices,
          RATES_ENTITY_TYPE.customRatesServices,
          RATES_ENTITY_TYPE.globalRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
        )
        .required(),
      then: id.required().allow(null),
    }).when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesLineItems,
          RATES_ENTITY_TYPE.customRatesLineItems,
          RATES_ENTITY_TYPE.globalRatesSurcharges,
          RATES_ENTITY_TYPE.customRatesSurcharges,
        )
        .required(),
      then: id.required().allow(null),
    }),
    equipmentItemId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesServices,
          RATES_ENTITY_TYPE.customRatesServices,
          RATES_ENTITY_TYPE.globalRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
        )
        .required(),
      then: id.required().allow(null),
    }),

    lineItemId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesLineItems,
          RATES_ENTITY_TYPE.customRatesLineItems,
          RATES_ENTITY_TYPE.globalRatesRecurringLineItems,
          RATES_ENTITY_TYPE.customRatesRecurringLineItems,
        )
        .required(),
      then: id.required(),
    }),

    surchargeId: Joi.when('entityType', {
      is: Joi.string()
        .valid(RATES_ENTITY_TYPE.globalRatesSurcharges, RATES_ENTITY_TYPE.customRatesSurcharges)
        .required(),
      then: id.required(),
    }),

    thresholdId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesThresholds,
          RATES_ENTITY_TYPE.globalThresholdsSetting,
          RATES_ENTITY_TYPE.customRatesThresholds,
        )
        .required(),
      then: id.required(),
    }),

    customRatesGroupId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.customRatesServices,
          RATES_ENTITY_TYPE.customRatesLineItems,
          RATES_ENTITY_TYPE.customRatesThresholds,
          RATES_ENTITY_TYPE.customThresholdsSetting,
          RATES_ENTITY_TYPE.customRatesSurcharges,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringLineItems,
        )
        .required(),
      then: id.required(),
    }),

    billingCycle: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesRecurringServices,
          RATES_ENTITY_TYPE.globalRatesRecurringLineItems,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringLineItems,
        )
        .required(),
      then: Joi.string().required(),
    }),

    frequencyId: Joi.when('entityType', {
      is: Joi.string()
        .valid(
          RATES_ENTITY_TYPE.globalRatesRecurringServices,
          RATES_ENTITY_TYPE.customRatesRecurringServices,
        )
        .required(),
      then: id.required().allow(null),
    }),
  })
  .required();
