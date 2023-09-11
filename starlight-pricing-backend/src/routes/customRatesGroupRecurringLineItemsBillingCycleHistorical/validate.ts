import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.required(),
    eventType: string.required(),
    userId: string.required(),
    traceId: string.required(),
    billableLineItemBillingCycleId: positiveInt.required(),
    customRatesGroupRecurringLineItemId: positiveInt.required(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    billableLineItemBillingCycleId: positiveInt.optional(),
    customRatesGroupRecurringLineItemId: positiveInt.optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
