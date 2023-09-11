import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();

export const createCustomRatesGroupLineItemsSchema = Joi.object()
  .keys({
    businessUnitId: positiveInt.required(),
    businessLineId: positiveInt.required(),
    oneTime: Joi.boolean().required(),
    customRatesGroupId: positiveInt.required(),
    lineItemId: positiveInt.required(),
    materialId: Joi.number().integer().optional(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupLineItemsSchema = Joi.object()
  .keys({
    businessUnitId: positiveInt.optional(),
    businessLineId: positiveInt.optional(),
    oneTime: Joi.boolean().optional(),
    customRatesGroupId: Joi.number().integer().optional(),
    lineItemId: Joi.number().integer().optional(),
    materialId: Joi.number().integer().optional(),
    price: Joi.number().integer().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().integer().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
