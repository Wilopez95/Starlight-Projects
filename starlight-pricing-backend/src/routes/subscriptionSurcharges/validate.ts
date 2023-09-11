import * as Joi from 'joi';
const number = Joi.number().integer().positive();

export const createSubscriptionSurcharge = Joi.object()
  .keys({
    subscriptionId: number.required(),
    subscriptionServiceItemId: number.required(),
    subscriptionRecurringLineItemId: number.required(),
    subscriptionOrderLineItemId: number.required(),
    subscriptionOrderId: number.required(),
    surchargeId: number.required(),
    billableLineItemId: number.optional(),
    billableServiceId: number.optional(),
    materialId: number.optional(),
    globalRatesSurchargesId: number.required(),
    customRatesGroupSurchargesId: number.required(),
    amount: number.optional(),
    quantity: number.optional(),
  })
  .required();

export const updateSubscriptionSurcharge = Joi.object()
  .keys({
    subscriptionId: number.optional(),
    subscriptionServiceItemId: number.optional(),
    subscriptionRecurringLineItemId: number.optional(),
    subscriptionOrderLineItemId: number.optional(),
    subscriptionOrderId: number.optional(),
    surchargeId: number.optional(),
    billableLineItemId: number.optional(),
    billableServiceId: number.optional(),
    materialId: number.optional(),
    globalRatesSurchargesId: number.optional(),
    customRatesGroupSurchargesId: number.optional(),
    amount: number.optional(),
    quantity: number.optional(),
  })
  .required();
