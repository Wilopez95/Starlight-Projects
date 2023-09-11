"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsMediaSchema = exports.createSubscriptionsMediaSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsMediaSchema = Joi.object()
    .keys({
    url: string.required(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    createdAt: date.required(),
    updatedAt: date.required(),
    subscriptionId: number.required(),
})
    .required();
exports.updateSubscriptionsMediaSchema = Joi.object()
    .keys({
    url: string.optional(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    subscriptionId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map