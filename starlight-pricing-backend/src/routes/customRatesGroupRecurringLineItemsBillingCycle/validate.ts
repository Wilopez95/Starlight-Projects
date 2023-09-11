import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();

export const createCustomRatesGroupRecurringLineItemsBillingCycleSchema = Joi.object()
  .keys({
    billableLineItemBillingCycleId: positiveInt.required(),
    customRatesGroupRecurringLineItemId: positiveInt.required(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupRecurringLineItemsBillingCycleSchema = Joi.object()
  .keys({
    billableLineItemBillingCycleId: positiveInt.optional(),
    customRatesGroupRecurringLineItemId: positiveInt.optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
