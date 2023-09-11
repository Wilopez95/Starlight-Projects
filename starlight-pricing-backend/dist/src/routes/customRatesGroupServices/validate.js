"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupServicesSchema = exports.createCustomRatesGroupServicesSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupServicesSchema = Joi.object()
    .keys({
    businessUnitId: number.required(),
    businessLineId: number.required(),
    customRatesGroupId: number.required(),
    billableServiceId: number.required(),
    materialId: number.optional(),
    equipmentItemId: number.required(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupServicesSchema = Joi.object()
    .keys({
    businessUnitId: number.optional(),
    businessLineId: number.optional(),
    customRatesGroupId: number.optional(),
    billableServiceId: number.optional(),
    materialId: number.optional(),
    equipmentItemId: number.optional(),
    price: number.optional(),
    effectiveDate: date.optional(),
    nextPrice: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map