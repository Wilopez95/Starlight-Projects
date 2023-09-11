import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();

export const createSubscriptionsPeriodsController = Joi.object()
  .keys({
    subscriptionWorkOrderId: positiveInt.optional(),
    billableLineItemId: positiveInt.required(),
    globalRatesLineItemsId: positiveInt.required(),
    customRatesGroupLineItemsId: positiveInt.required(),
    price: Joi.number().optional(),
    quantity: positiveInt.required(),
    materialId: Joi.number().optional(),
    workOrderLineItemId: positiveInt.optional(),
    unlockOverrides: Joi.boolean().required(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    priceId: positiveInt.required(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionOrderId: positiveInt.required(),
  })
  .required();

export const updateSubscriptionsPeriodsController = Joi.object()
  .keys({
    subscriptionWorkOrderId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    globalRatesLineItemsId: positiveInt.optional(),
    customRatesGroupLineItemsId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    materialId: positiveInt.optional(),
    workOrderLineItemId: positiveInt.optional(),
    unlockOverrides: Joi.boolean().optional(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    priceId: positiveInt.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionOrderId: positiveInt.optional(),
  })
  .required();
