"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupLineItemsSchema = exports.createCustomRatesGroupLineItemsSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupLineItemsSchema = Joi.object()
    .keys({
    businessUnitId: number.required(),
    businessLineId: number.required(),
    oneTime: Joi.boolean().required(),
    customRatesGroupId: number.required(),
    lineItemId: number.required(),
    materialId: number.optional(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupLineItemsSchema = Joi.object()
    .keys({
    businessUnitId: number.optional(),
    businessLineId: number.optional(),
    oneTime: Joi.boolean().optional(),
    customRatesGroupId: number.optional(),
    lineItemId: number.optional(),
    materialId: number.optional(),
    price: number.optional(),
    effectiveDate: date.optional(),
    nextPrice: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map