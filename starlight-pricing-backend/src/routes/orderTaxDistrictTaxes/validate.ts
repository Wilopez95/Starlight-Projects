import * as Joi from 'joi';
const number = Joi.number().integer().positive();

export const createOrderTaxDistrictTaxesSchema = Joi.object()
  .keys({
    orderTaxDistrictId: number.required(),
    perTonRate: Joi.number().optional().allow(null),
    percentageRate: Joi.number().optional().allow(null),
    amount: Joi.number().required(),
    flatRate: Joi.boolean().optional().allow(null),
    calculatedPerOrder: Joi.boolean().optional().allow(null),
    type: Joi.string().required(),
    lineItemId: number.optional(),
    lineItemPerQuantityRate: Joi.number().optional().allow(null),
    thresholdId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();

export const updateOrderTaxDistrictTaxesSchema = Joi.object()
  .keys({
    orderTaxDistrictId: number.optional(),
    perTonRate: Joi.number().optional().allow(null),
    percentageRate: Joi.number().optional().allow(null),
    amount: Joi.number().optional(),
    flatRate: Joi.boolean().optional().allow(null),
    calculatedPerOrder: Joi.boolean().optional().allow(null),
    type: Joi.string().optional(),
    lineItemId: number.optional(),
    lineItemPerQuantityRate: Joi.number().optional().allow(null),
    thresholdId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
  })
  .required();
