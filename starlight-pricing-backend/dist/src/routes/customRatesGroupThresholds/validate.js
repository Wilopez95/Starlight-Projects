"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupThresholdsSchema = exports.createCustomRatesGroupThresholdsSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createCustomRatesGroupThresholdsSchema = Joi.object()
    .keys({
    thresholdId: number.required(),
    price: number.optional(),
    limit: number.optional(),
    businessUnitId: number.required(),
    businessLineId: number.required(),
    equipmentItemId: number.optional(),
    materialId: number.optional(),
    customRatesGroupId: number.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
exports.updateCustomRatesGroupThresholdsSchema = Joi.object()
    .keys({
    thresholdId: number.optional(),
    price: number.optional(),
    limit: number.optional(),
    businessUnitId: number.optional(),
    businessLineId: number.optional(),
    equipmentItemId: number.optional(),
    materialId: number.optional(),
    customRatesGroupId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map