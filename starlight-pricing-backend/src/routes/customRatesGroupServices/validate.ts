import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();

export const createCustomRatesGroupServicesSchema = Joi.object()
  .keys({
    businessUnitId: positiveInt.required(),
    businessLineId: positiveInt.required(),
    customRatesGroupId: positiveInt.required(),
    billableServiceId: positiveInt.required(),
    materialId: positiveInt.optional(),
    equipmentItemId: positiveInt.required(),
    price: Joi.number().required(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().required(),
    createdAt: date.required(),
    updatedAt: date.required(),
  })
  .required();

export const updateCustomRatesGroupServicesSchema = Joi.object()
  .keys({
    businessUnitId: positiveInt.optional(),
    businessLineId: positiveInt.optional(),
    customRatesGroupId: positiveInt.optional(),
    billableServiceId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    equipmentItemId: positiveInt.optional(),
    price: Joi.number().optional(),
    effectiveDate: date.optional(),
    nextPrice: Joi.number().optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
