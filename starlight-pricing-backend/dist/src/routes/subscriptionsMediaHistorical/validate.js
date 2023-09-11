"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsMediaHistoricalSchema = exports.createSubscriptionsMediaHistoricalSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsMediaHistoricalSchema = Joi.object()
    .keys({
    originalId: number.required(),
    eventType: string.optional(),
    userId: string.required(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    url: string.required(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.required(),
})
    .required();
exports.updateSubscriptionsMediaHistoricalSchema = Joi.object()
    .keys({
    originalId: number.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    url: string.optional(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map