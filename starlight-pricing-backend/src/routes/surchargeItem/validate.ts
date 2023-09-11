import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();

export const createSurchargeItemSchema = Joi.object()
  .keys({
    orderId: positiveInt,
    surchargeId: positiveInt.required(),
    billableLineItemId: positiveInt.optional(),
    billableServiceId: positiveInt.optional(),
    thresholdId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    globalRatesSurchargesId: positiveInt.optional(),
    customRatesGroupSurchargesId: positiveInt.optional().allow(null),
    amount: Joi.number().optional(),
    quantity: positiveInt.optional(),
    priceId: positiveInt.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    lineItemId: positiveInt.optional(),
    thresholdItemId: positiveInt.optional(),
  })
  .required();

export const bulkCreateSurchargeItemSchema = Joi.object().keys({
  data: Joi.array().items(createSurchargeItemSchema),
});

export const updateSurchargeItemSchema = Joi.object()
  .keys({
    orderId: positiveInt,
    surchargeId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    billableServiceId: positiveInt.optional(),
    thresholdId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    globalRatesSurchargesId: positiveInt.optional(),
    customRatesGroupSurchargesId: positiveInt.optional().allow(null),
    amount: Joi.number().optional(),
    quantity: positiveInt.optional(),
    priceId: positiveInt.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    lineItemId: positiveInt.optional(),
    thresholdItemId: positiveInt.optional(),
  })
  .required();
