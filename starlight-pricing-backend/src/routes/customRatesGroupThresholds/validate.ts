import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();

export const createCustomRatesGroupThresholdsSchema = Joi.object()
  .keys({
    thresholdId: positiveInt.required(),
    price: Joi.number().optional(),
    limit: Joi.number().optional(),
    businessUnitId: positiveInt.required(),
    businessLineId: positiveInt.required(),
    equipmentItemId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    customRatesGroupId: positiveInt.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();

export const updateCustomRatesGroupThresholdsSchema = Joi.object()
  .keys({
    thresholdId: positiveInt.optional(),
    price: Joi.number().optional(),
    limit: Joi.number().optional(),
    businessUnitId: positiveInt.optional(),
    businessLineId: positiveInt.optional(),
    equipmentItemId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    customRatesGroupId: positiveInt.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();
