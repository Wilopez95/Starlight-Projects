import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createCustomRatesGroupServiceFrequencyHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.required(),
    eventType: string.required(),
    userId: string.required(),
    traceId: string.required(),
    billableServiceFrequencyId: positiveInt.required(),
    customRatesGroupRecurringServiceId: positiveInt.required(),
    billingCycle: Joi.number().required(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupServiceFrecuencyHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    billableServiceFrequencyId: positiveInt.optional(),
    customRatesGroupRecurringServiceId: positiveInt.optional(),
    billingCycle: Joi.number().optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
