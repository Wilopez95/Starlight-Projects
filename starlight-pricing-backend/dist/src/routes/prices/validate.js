"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceSchema = exports.createPriceSchema = void 0;
const Joi = require("joi");
let id = Joi.number().integer().positive();
exports.createPriceSchema = Joi.object()
    .keys({
    priceGroupId: id.required(),
    entityType: Joi.string().required(),
    billableServiceId: id.required(),
    billableLineItemId: id.required(),
    materialId: id.optional(),
    thresholdId: id.optional(),
    surchargeId: id.optional(),
    billingCycle: Joi.string().required(),
    frequencyId: id.optional(),
    price: Joi.number().required(),
    nextPrice: Joi.number().optional(),
    limit: Joi.number().optional(),
    userId: Joi.string().required(),
    createdAt: Joi.date().optional(),
    traceId: Joi.string().required(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
})
    .required();
exports.updatePriceSchema = Joi.object()
    .keys({
    priceGroupId: id.optional(),
    entityType: Joi.string().optional(),
    billableServiceId: id.optional(),
    billableLineItemId: id.optional(),
    materialId: id.optional(),
    thresholdId: id.optional(),
    surchargeId: id.optional(),
    billingCycle: Joi.string().optional(),
    frequencyId: id.optional(),
    price: Joi.number().optional(),
    nextPrice: Joi.number().optional(),
    limit: Joi.number().optional(),
    userId: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    traceId: Joi.string().optional(),
    startAt: Joi.date().optional(),
    endAt: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map