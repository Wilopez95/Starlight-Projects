"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupSurchargesSchema = exports.createCustomRatesGroupSurchagesSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createCustomRatesGroupSurchagesSchema = Joi.object()
    .keys({
    surchargeId: number.required(),
    price: number.optional(),
    businessUnitId: number.required(),
    businessLineId: number.required(),
    materialId: number.optional(),
    customRatesGroupId: number.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
exports.updateCustomRatesGroupSurchargesSchema = Joi.object()
    .keys({
    surcharge_id: number.optional(),
    price: number.optional(),
    businessUnitId: number.optional(),
    businessLineId: number.optional(),
    material_id: number.optional(),
    custom_rates_group_id: number.optional(),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map