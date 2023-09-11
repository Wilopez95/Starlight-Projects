import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();

export const createCustomRatesGroupSurchagesSchema = Joi.object()
  .keys({
    surchargeId: positiveInt.required(),
    price: Joi.number().optional(),
    businessUnitId: positiveInt.required(),
    businessLineId: positiveInt.required(),
    materialId: positiveInt.optional(),
    customRatesGroupId: positiveInt.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();

export const updateCustomRatesGroupSurchargesSchema = Joi.object()
  .keys({
    surcharge_id: positiveInt.optional(),
    price: Joi.number().optional(),
    businessUnitId: positiveInt.optional(),
    businessLineId: positiveInt.optional(),
    material_id: positiveInt.optional(),
    custom_rates_group_id: positiveInt.optional(),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
  })
  .required();
