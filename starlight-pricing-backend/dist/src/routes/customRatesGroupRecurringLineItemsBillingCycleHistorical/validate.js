"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = exports.createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = Joi.object()
    .keys({
    originalId: number.required(),
    eventType: string.required(),
    userId: string.required(),
    traceId: string.required(),
    billableLineItemBillingCycleId: number.required(),
    customRatesGroupRecurringLineItemId: number.required(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupRecurringLineItemsBillingCycleHistoricalSchema = Joi.object()
    .keys({
    originalId: number.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
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