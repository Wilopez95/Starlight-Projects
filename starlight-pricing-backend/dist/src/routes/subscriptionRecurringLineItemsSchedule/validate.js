"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsRecurrenigLineItemsSchedule = exports.createSubscriptionsRecurrenigLineItemsSchedule = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsRecurrenigLineItemsSchedule = Joi.object()
    .keys({
    subscriptionId: number.required(),
    subscriptionRecurringLineItemId: number.required(),
    billableLineItemId: number.required(),
    priceId: number.required(),
    billingCycle: string.required(),
    quantity: number,
    overridePrice: Joi.boolean(),
    overrideProration: Joi.boolean(),
    price: number.required(),
    overriddenPrice: number.required(),
    nextPrice: number,
    amount: number,
    proratedAmount: number,
    overriddenProratedAmount: number,
    total: number,
    startAt: date.required(),
    endAt: date,
    invoicedAt: date,
    paidAt: date,
    createdAt: date,
})
    .required();
exports.updateSubscriptionsRecurrenigLineItemsSchedule = Joi.object()
    .keys({
    subscriptionId: number.optional(),
    subscriptionRecurringLineItemId: number.optional(),
    billableLineItemId: number.optional(),
    priceId: number.optional(),
    billingPycle: string.optional(),
    quantity: number.optional(),
    overridePrice: Joi.boolean(),
    overrideProration: Joi.boolean(),
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
    createdAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map