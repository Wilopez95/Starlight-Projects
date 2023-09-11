import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();

export const createSubscriptionsServiceItemsSchedule = Joi.object()
  .keys({
    subscriptionId: positiveInt.required(),
    subscriptionServiceItemId: positiveInt.required(),
    billableServiceId: positiveInt.required(),
    materialId: positiveInt.optional(),
    priceId: positiveInt.required(),
    billingCycle: string.required(),
    frequencyId: positiveInt.optional(),
    serviceDaysOfWeek: Joi.object(),
    quantity: positiveInt.optional(),
    overridePrice: Joi.boolean().optional(),
    overrideProration: Joi.boolean().optional(),
    price: Joi.number().required(),
    overriddenPrice: Joi.number().required(),
    nextPrice: Joi.number().optional(),
    amount: Joi.number().optional(),
    proratedAmount: Joi.number().optional(),
    overriddenProratedAmount: Joi.number().optional(),
    total: Joi.number().optional(),
    startAt: date.required(),
    endAt: date.optional(),
    invoicedAt: date.optional(),
  })
  .required();

export const updateSubscriptionsServiceItemsSchedule = Joi.object()
  .keys({
    subscriptionId: positiveInt.optional(),
    subscriptionServiceItemId: positiveInt.optional(),
    billableServiceId: positiveInt.optional(),
    materialId: positiveInt.optional(),
    priceId: positiveInt.optional(),
    billingCycle: string.optional(),
    frequencyId: positiveInt.optional(),
    serviceDaysOfWeek: Joi.object(),
    quantity: positiveInt.optional(),
    overridePrice: Joi.boolean().optional(),
    overrideProration: Joi.boolean().optional(),
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
  })
  .required();
