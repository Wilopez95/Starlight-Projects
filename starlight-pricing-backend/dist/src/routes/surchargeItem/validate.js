"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSurchargeItemSchema = exports.bulkCreateSurchargeItemSchema = exports.createSurchargeItemSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createSurchargeItemSchema = Joi.object()
    .keys({
    orderId: number,
    surchargeId: number.required(),
    billableLineItemId: number.optional(),
    billableServiceId: number.optional(),
    thresholdId: number.optional(),
    materialId: number.optional(),
    globalRatesSurchargesId: number.optional(),
    customRatesGroupSurchargesId: number.optional().allow(null),
    amount: Joi.number().optional(),
    quantity: number.optional(),
    priceId: number.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    lineItemId: number.optional(),
    thresholdItemId: number.optional(),
})
    .required();
exports.bulkCreateSurchargeItemSchema = Joi.object().keys({
    data: Joi.array().items(exports.createSurchargeItemSchema),
});
exports.updateSurchargeItemSchema = Joi.object()
    .keys({
    orderId: number,
    surchargeId: number.optional(),
    billableLineItemId: number.optional(),
    billableServiceId: number.optional(),
    thresholdId: number.optional(),
    materialId: number.optional(),
    globalRatesSurchargesId: number.optional(),
    customRatesGroupSurchargesId: number.optional().allow(null),
    amount: Joi.number().optional(),
    quantity: number.optional(),
    priceId: number.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    lineItemId: number.optional(),
    thresholdItemId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map