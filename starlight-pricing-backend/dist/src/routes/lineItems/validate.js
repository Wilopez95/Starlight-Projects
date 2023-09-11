"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemsSchema = exports.bulkCreateLineItemsSchema = exports.updateLineItemsInOrder = exports.createLineItemsSchema = void 0;
const Joi = require("joi");
let id = Joi.number().integer().positive();
const positiveFloat = Joi.number().positive();
exports.createLineItemsSchema = Joi.object()
    .keys({
    orderId: id.required(),
    billableLineItemId: id.required(),
    materialId: id.optional().allow(null),
    globalRatesLineItemsId: id.optional().allow(null),
    customRatesGroupLineItemsId: id.optional().allow(null),
    price: positiveFloat.required().allow(0),
    quantity: id.required(),
    manifestNumber: Joi.string().optional(),
    landfillOperation: Joi.boolean().optional().allow(null),
    priceId: id.optional().allow(null),
    overridePrice: Joi.boolean().optional().allow(null),
    overriddenPrice: id.optional().allow(null),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional().allow(null),
    updatedAt: Joi.date().optional().allow(null),
    applySurcharges: Joi.boolean().optional(),
})
    .required();
exports.updateLineItemsInOrder = Joi.object()
    .keys({
    id: id.optional(),
    orderId: id.optional(),
    billableLineItemId: id.required(),
    materialId: id.optional().allow(null),
    globalRatesLineItemsId: id.optional().allow(null),
    customRatesGroupLineItemsId: id.optional().allow(null),
    price: positiveFloat.required().allow(0),
    quantity: id.required(),
    applySurcharges: Joi.boolean().optional(),
})
    .required();
exports.bulkCreateLineItemsSchema = Joi.object().keys({
    data: Joi.array().items(exports.createLineItemsSchema),
});
exports.updateLineItemsSchema = Joi.object()
    .keys({
    orderId: id.optional(),
    billableLineItemId: id.optional(),
    materialId: id.optional().allow(null),
    globalRatesLineItemsId: id.optional(),
    customRatesGroupLineItemsId: id.optional(),
    price: positiveFloat.optional().allow(0),
    quantity: id.optional(),
    manifestNumber: Joi.string().optional(),
    landfillOperation: Joi.boolean().optional().allow(null),
    priceId: id.optional().allow(null),
    overridePrice: Joi.boolean().optional().allow(null),
    overriddenPrice: id.optional().allow(null),
    invoicedAt: Joi.date().optional(),
    paidAt: Joi.date().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    applySurcharges: Joi.boolean().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map