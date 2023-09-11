"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscriptionHistorySchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionHistorySchema = Joi.object()
    .keys({
    subscriptionId: number.required(),
    action: string.required(),
    attribute: string.optional(),
    entity: string.optional(),
    entityAction: string.optional(),
    madeBy: string.required(),
    madeById: string.optional(),
    effectiveDate: date.optional(),
    description: Joi.object().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map