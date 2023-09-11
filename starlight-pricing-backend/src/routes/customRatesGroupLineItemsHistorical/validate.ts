import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createCustomRatesGroupLineItemsHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.required(),
    eventType: string.required(),
    userId: string.required(),
    traceId: string.required(),
    businessUnitId: positiveInt.required(),
    businessLineId: positiveInt.required(),
    oneTime: Joi.boolean().required(),
    customRatesGroupId: positiveInt.required(),
    lineItemId: positiveInt.required(),
    materialId: positiveInt.optional(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupLineItemsHistoricalSchema = Joi.object()
  .keys({
    originalId: positiveInt.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    businessUnitId: positiveInt.optional(),
    businessLineId: positiveInt.optional(),
    oneTime: Joi.boolean().optional(),
    customRatesGroupId: positiveInt.optional(),
    lineItemId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
