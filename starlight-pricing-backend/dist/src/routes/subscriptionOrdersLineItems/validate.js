"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsPeriodsController = exports.createSubscriptionsPeriodsController = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsPeriodsController = Joi.object()
    .keys({
    subscriptionWorkOrderId: number.optional(),
    billableLineItemId: number.required(),
    globalRatesLineItemsId: number.required(),
    customRatesGroupLineItemsId: number.required(),
    price: number.optional(),
    quantity: number.required(),
    materialId: number.optional(),
    workOrderLineItemId: number.optional(),
    unlockOverrides: Joi.boolean().required(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    priceId: number.required(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionOrderId: number.required(),
})
    .required();
exports.updateSubscriptionsPeriodsController = Joi.object()
    .keys({
    subscriptionWorkOrderId: number.optional(),
    billableLineItemId: number.optional(),
    globalRatesLineItemsId: number.optional(),
    customRatesGroupLineItemsId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    materialId: number.optional(),
    workOrderLineItemId: number.optional(),
    unlockOverrides: Joi.boolean().optional(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    priceId: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionOrderId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map