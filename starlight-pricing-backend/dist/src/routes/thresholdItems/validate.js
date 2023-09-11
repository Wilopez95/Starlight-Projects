"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateThresholdItemSchema = exports.bulkCreateThresholdItemSchema = exports.createThresholdItemSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createThresholdItemSchema = Joi.object()
    .keys({
    orderId: number.required(),
    thresholdId: number.required(),
    globalRatesThresholdsId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    priceId: number.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    applySurcharges: Joi.boolean().required(),
    customRatesGroupThresholdsId: number.optional().allow(null),
})
    .required();
exports.bulkCreateThresholdItemSchema = Joi.object().keys({
    data: Joi.array().items(exports.createThresholdItemSchema),
});
exports.updateThresholdItemSchema = Joi.object()
    .keys({
    orderId: number.optional(),
    thresholdId: number.optional(),
    globalRatesThresholdsId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    priceId: number.optional(),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    priceToDisplay: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    applySurcharges: Joi.boolean().optional(),
    customRatesGroupThresholdsId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map