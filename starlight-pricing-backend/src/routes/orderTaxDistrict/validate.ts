import * as Joi from 'joi';
const number = Joi.number().integer().positive();

export const createOrderTaxDistrictSchema = Joi.object()
  .keys({
    taxDistrictId: number.required(),
    orderId: number.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();

export const bulkCreateOrderTaxDistrictSchema = Joi.object().keys({
  data: Joi.array().items(createOrderTaxDistrictSchema),
});

export const updateOrderTaxDistrictSchema = Joi.object()
  .keys({
    taxDistrictId: number.optional(),
    orderId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();
