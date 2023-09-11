import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();

export const createThresholdItemSchema = Joi.object()
  .keys({
    orderId: positiveInt.required(),
    thresholdId: positiveInt.required(),
    globalRatesThresholdsId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    priceId: positiveInt.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    applySurcharges: Joi.boolean().required(),
    customRatesGroupThresholdsId: positiveInt.optional().allow(null),
  })
  .required();

export const bulkCreateThresholdItemSchema = Joi.object().keys({
  data: Joi.array().items(createThresholdItemSchema),
});

export const updateThresholdItemSchema = Joi.object()
  .keys({
    orderId: positiveInt.optional(),
    thresholdId: positiveInt.optional(),
    globalRatesThresholdsId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    priceId: positiveInt.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    priceToDisplay: Joi.number().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    applySurcharges: Joi.boolean().optional(),
    customRatesGroupThresholdsId: positiveInt.optional(),
  })
  .required();
