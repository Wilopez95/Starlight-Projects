"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderTaxDistrictTaxesSchema = exports.createOrderTaxDistrictTaxesSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createOrderTaxDistrictTaxesSchema = Joi.object()
    .keys({
    orderTaxDistrictId: number.required(),
    perTonRate: Joi.number().optional().allow(null),
    percentageRate: Joi.number().optional().allow(null),
    amount: Joi.number().required(),
    flatRate: Joi.boolean().optional().allow(null),
    calculatedPerOrder: Joi.boolean().optional().allow(null),
    type: Joi.string().required(),
    lineItemId: number.optional(),
    lineItemPerQuantityRate: Joi.number().optional().allow(null),
    thresholdId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
exports.updateOrderTaxDistrictTaxesSchema = Joi.object()
    .keys({
    orderTaxDistrictId: number.optional(),
    perTonRate: Joi.number().optional().allow(null),
    percentageRate: Joi.number().optional().allow(null),
    amount: Joi.number().optional(),
    flatRate: Joi.boolean().optional().allow(null),
    calculatedPerOrder: Joi.boolean().optional().allow(null),
    type: Joi.string().optional(),
    lineItemId: number.optional(),
    lineItemPerQuantityRate: Joi.number().optional().allow(null),
    thresholdId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map