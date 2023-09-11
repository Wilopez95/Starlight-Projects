"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionSurcharge = exports.createSubscriptionSurcharge = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();
exports.createSubscriptionSurcharge = Joi.object()
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
exports.updateSubscriptionSurcharge = Joi.object()
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
//# sourceMappingURL=validate.js.map