"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRecurrentOrderTemplateLineItemsHistorical = exports.createRecurrentOrderTemplateLineItemsHistorical = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();
exports.createRecurrentOrderTemplateLineItemsHistorical = Joi.object()
    .keys({
    originalId: number.required(),
    eventType: string.optional(),
    userId: string.required(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    recurrentOrderTemplateId: number.required(),
    billableLineItemId: number.required(),
    materialId: number.optional(),
    globalRatesLineItemsId: number.required(),
    customRatesGroupLineItemsId: number.optional(),
    price: number.required(),
    quantity: number.required(),
    applySurcharges: boolean.required(),
    // refactor starts here
    priceId: number.required(),
})
    .required();
exports.updateRecurrentOrderTemplateLineItemsHistorical = Joi.object()
    .keys({
    originalId: number.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
    recurrentOrderTemplateId: number.optional(),
    billableLineItemId: number.optional(),
    materialId: number.optional(),
    globalRatesLineItemsId: number.optional(),
    customRatesGroupLineItemsId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    applySurcharges: boolean.optional(),
    // refactor starts here
    priceId: number.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map