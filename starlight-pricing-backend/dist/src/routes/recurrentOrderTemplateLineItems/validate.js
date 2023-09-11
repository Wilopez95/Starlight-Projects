"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecurrentOrderTemplateLineItems = exports.bulkCreateRecurrentOrderTemplateLineItemsSchema = exports.createRecurrentOrderTemplateLineItems = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();
exports.createRecurrentOrderTemplateLineItems = Joi.object()
    .keys({
    recurrentOrderTemplateId: number.required(),
    billableLineItemId: number.required(),
    materialId: number.optional().allow(null),
    globalRatesLineItemsId: number.required(),
    customRatesGroupLineItemsId: number.optional(),
    price: number.required(),
    quantity: number.required(),
    applySurcharges: boolean.required(),
    // refactor starts here
    priceId: number.optional().allow(null),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
exports.bulkCreateRecurrentOrderTemplateLineItemsSchema = Joi.object().keys({
    data: Joi.array().items(exports.createRecurrentOrderTemplateLineItems),
});
exports.updateRecurrentOrderTemplateLineItems = Joi.object()
    .keys({
    recurrentOrderTemplateId: number.optional(),
    billableLineItemId: number.optional(),
    materialId: number.optional().allow(null),
    globalRatesLineItemsId: number.optional(),
    customRatesGroupLineItemsId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    applySurcharges: boolean.optional(),
    // refactor starts here
    priceId: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map