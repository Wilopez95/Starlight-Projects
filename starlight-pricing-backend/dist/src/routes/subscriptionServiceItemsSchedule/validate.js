"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsServiceItemsSchedule = exports.createSubscriptionsServiceItemsSchedule = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsServiceItemsSchedule = Joi.object()
    .keys({
    subscriptionId: number.required(),
    subscriptionServiceItemId: number.required(),
    billableServiceId: number.required(),
    materialId: number.optional(),
    priceId: number.required(),
    billingCycle: string.required(),
    frequencyId: number.optional(),
    serviceDaysOfWeek: Joi.object(),
    quantity: number.optional(),
    overridePrice: Joi.boolean().optional(),
    overrideProration: Joi.boolean().optional(),
    price: number.required(),
    overriddenPrice: number.required(),
    nextPrice: number.optional(),
    amount: number.optional(),
    proratedAmount: number.optional(),
    overriddenProratedAmount: number.optional(),
    total: number.optional(),
    startAt: date.required(),
    endAt: date.optional(),
    invoicedAt: date.optional(),
})
    .required();
exports.updateSubscriptionsServiceItemsSchedule = Joi.object()
    .keys({
    subscriptionId: number.optional(),
    subscriptionServiceItemId: number.optional(),
    billableServiceId: number.optional(),
    materialId: number.optional(),
    priceId: number.optional(),
    billingCycle: string.optional(),
    frequencyId: number.optional(),
    serviceDaysOfWeek: Joi.object(),
    quantity: number.optional(),
    overridePrice: Joi.boolean().optional(),
    overrideProration: Joi.boolean().optional(),
    price: number.optional(),
    overriddenPrice: number.optional(),
    nextPrice: number.optional(),
    amount: number.optional(),
    proratedAmount: number.optional(),
    overriddenProratedAmount: number.optional(),
    total: number.optional(),
    startAt: date.optional(),
    endAt: date.optional(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map