"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionOrderMedia = exports.createSubscriptionOrderMedia = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
exports.createSubscriptionOrderMedia = Joi.object()
    .keys({
    url: string.required(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.required()
})
    .required();
exports.updateSubscriptionOrderMedia = Joi.object()
    .keys({
    url: string.optional(),
    fileName: string.optional().allow(null),
    author: string.optional().allow(null),
    subscriptionId: number.optional()
})
    .required();
//# sourceMappingURL=validate.js.map