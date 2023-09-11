"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupRecurringLineItemsBillingCycleSchema = exports.createCustomRatesGroupRecurringLineItemsBillingCycleSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupRecurringLineItemsBillingCycleSchema = Joi.object()
    .keys({
    billableLineItemBillingCycleId: number.required(),
    customRatesGroupRecurringLineItemId: number.required(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupRecurringLineItemsBillingCycleSchema = Joi.object()
    .keys({
    billableLineItemBillingCycleId: number.optional(),
    customRatesGroupRecurringLineItemId: number.optional(),
    price: number.optional(),
    effectiveDate: date.optional(),
    nextPrice: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map