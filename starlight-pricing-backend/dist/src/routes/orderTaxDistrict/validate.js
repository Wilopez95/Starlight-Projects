"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderTaxDistrictSchema = exports.bulkCreateOrderTaxDistrictSchema = exports.createOrderTaxDistrictSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
exports.createOrderTaxDistrictSchema = Joi.object()
    .keys({
    taxDistrictId: number.required(),
    orderId: number.required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
exports.bulkCreateOrderTaxDistrictSchema = Joi.object().keys({
    data: Joi.array().items(exports.createOrderTaxDistrictSchema),
});
exports.updateOrderTaxDistrictSchema = Joi.object()
    .keys({
    taxDistrictId: number.optional(),
    orderId: number.optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map