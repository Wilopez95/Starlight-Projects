import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createSubscriptionsRecurrenigLineItemsSchedule = Joi.object()
  .keys({
    subscriptionId: positiveInt.required(),
    subscriptionRecurringLineItemId: positiveInt.required(),
    billableLineItemId: positiveInt.required(),
    priceId: positiveInt.required(),
    billingCycle: string.required(),
    quantity: positiveInt,
    overridePrice: Joi.boolean(),
    overrideProration: Joi.boolean(),
    price: Joi.number().required(),
    overriddenPrice: Joi.number().required(),
    nextPrice: Joi.number(),
    amount: Joi.number(),
    proratedAmount: Joi.number(),
    overriddenProratedAmount: Joi.number(),
    total: Joi.number(),
    startAt: date.required(),
    endAt: date,
    invoicedAt: date,
    paidAt: date,
    createdAt: date,
  })
  .required();

export const updateSubscriptionsRecurrenigLineItemsSchedule = Joi.object()
  .keys({
    subscriptionId: positiveInt.optional(),
    subscriptionRecurringLineItemId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    priceId: positiveInt.optional(),
    billingPycle: string.optional(),
    quantity: positiveInt.optional(),
    overridePrice: Joi.boolean(),
    overrideProration: Joi.boolean(),
    price: Joi.number().optional(),
    overriddenPrice: Joi.number().optional(),
    nextPrice: Joi.number().optional(),
    amount: Joi.number().optional(),
    proratedAmount: Joi.number().optional(),
    overriddenProratedAmount: Joi.number().optional(),
    total: Joi.number().optional(),
    startAt: date.optional(),
    endAt: date.optional(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    createdAt: date.optional(),
  })
  .required();
