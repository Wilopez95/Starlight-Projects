import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createCustomRatesGroupServiceFrequencySchema = Joi.object()
  .keys({
    billableServiceFrequencyId: positiveInt.required(),
    customRatesGroupRecurringServiceId: positiveInt.required(),
    billingCycle: string.required(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupServiceFrecuencySchema = Joi.object()
  .keys({
    billableServiceFrequencyId: positiveInt.optional(),
    customRatesGroupRecurringServiceId: positiveInt.optional(),
    billingCycle: string.optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
