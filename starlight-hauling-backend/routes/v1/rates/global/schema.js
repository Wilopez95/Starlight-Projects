import Joi from 'joi';

import { THRESHOLD_SETTINGS } from '../../../../consts/thresholdSettings.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../../consts/billingCycles.js';
import { FREQUENCY_TYPES } from '../../../../consts/frequencyTypes.js';

const id = Joi.number().integer().positive();

const globalRatesService = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    billableServiceId: id.required(),
    materialId: id.required().allow(null),
    equipmentItemId: id.required(),

    price: Joi.number().min(0).required(),
  })
  .required();

export const globalRatesServiceData = Joi.array().items(globalRatesService).min(1).required();

const globalRatesRecurringService = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    billableServiceId: id.required(),
    materialId: id.allow(null).required(),
    equipmentItemId: id.required(),

    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .required(),

    frequencies: Joi.array().items(
      Joi.object().keys({
        times: Joi.number().integer().positive().allow(null),
        type: Joi.string()
          .valid(...FREQUENCY_TYPES)
          .allow(null)
          .required(),
        price: Joi.number().min(0).required(),
      }),
    ),
  })
  .required();

export const globalRatesRecurringServiceData = Joi.array()
  .items(globalRatesRecurringService)
  .min(1)
  .required();

const globalRatesLineItem = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    lineItemId: id.required(),
    materialId: id.optional(),

    price: Joi.number().min(0).required(),
  })
  .required();

export const globalRatesLineItemData = Joi.array().items(globalRatesLineItem).min(1).required();

const globalRatesSurcharge = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    surchargeId: id.required(),
    materialId: id.optional(),

    price: Joi.number().min(0).required(),
  })
  .required();

export const globalRatesSurchargeData = Joi.array().items(globalRatesSurcharge).min(1).required();

const globalRatesRecurringLineItem = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    lineItemId: id.required(),

    billingCycles: Joi.array().items(
      Joi.object().keys({
        billingCycle: Joi.string()
          .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
          .required(),

        price: Joi.number().min(0).required(),
      }),
    ),
  })
  .required();

export const globalRatesRecurringLineItemData = Joi.array()
  .items(globalRatesRecurringLineItem)
  .min(1)
  .required();

const globalRatesThreshold = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    thresholdId: id.required(),

    equipmentItemId: id.optional(),
    materialId: id.optional(),

    price: Joi.number().min(0).required(),
    limit: Joi.number().min(0).required(),
  })
  .required();

export const globalRatesThresholdData = Joi.array().items(globalRatesThreshold).min(1).required();

export const serviceParams = Joi.object()
  .keys({
    billableServiceId: id,
    materialId: id.allow(null),
    equipmentItemId: id,
  })
  .required();

export const recurringServiceParams = Joi.object()
  .keys({
    billableServiceId: id,
    materialId: id.allow(null).required(),
    equipmentItemId: id,
  })
  .required();

export const lineItemParams = Joi.object()
  .keys({
    lineItemId: id,
    materialId: id.allow(null),
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

export const globalRatesThresholdParam = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
  })
  .required();

export const globalThresholdSetting = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),

    setting: Joi.string()
      .valid(...THRESHOLD_SETTINGS)
      .required(),
  })
  .required();
