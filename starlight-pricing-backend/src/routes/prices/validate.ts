import * as Joi from 'joi';

const id = Joi.number().integer().positive();

export const createPriceSchema = Joi.object()
  .keys({
    priceGroupId: id.required(),
    entityType: Joi.string().required(),
    billableServiceId: id.required(),
    billableLineItemId: id.required(),
    materialId: id.optional(),
    thresholdId: id.optional(),
    surchargeId: id.optional(),
    billingCycle: Joi.string().required(),
    frequencyId: id.optional(),
    price: Joi.number().required(),
    nextPrice: Joi.number().optional(),
    limit: Joi.number().optional(),
    userId: Joi.string().required(),
    createdAt: Joi.date().optional(),
    traceId: Joi.string().required(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
  })
  .required();

export const updatePriceSchema = Joi.object()
  .keys({
    priceGroupId: id.optional(),
    entityType: Joi.string().optional(),
    billableServiceId: id.optional(),
    billableLineItemId: id.optional(),
    materialId: id.optional(),
    thresholdId: id.optional(),
    surchargeId: id.optional(),
    billingCycle: Joi.string().optional(),
    frequencyId: id.optional(),
    price: Joi.number().optional(),
    nextPrice: Joi.number().optional(),
    limit: Joi.number().optional(),
    userId: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    traceId: Joi.string().optional(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
  })
  .required();
