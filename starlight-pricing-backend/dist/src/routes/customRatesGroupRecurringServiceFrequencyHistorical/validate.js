"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupServiceFrecuencyHistoricalSchema = exports.createCustomRatesGroupServiceFrequencyHistoricalSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupServiceFrequencyHistoricalSchema = Joi.object()
    .keys({
    originalId: number.required(),
    eventType: string.required(),
    userId: string.required(),
    traceId: string.required(),
    billableServiceFrequencyId: number.required(),
    customRatesGroupRecurringServiceId: number.required(),
    billingCycle: number.required(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupServiceFrecuencyHistoricalSchema = Joi.object()
    .keys({
    originalId: number.optional(),
    eventType: string.optional(),
    userId: string.optional(),
    traceId: string.optional(),
    billableServiceFrequencyId: number.optional(),
    customRatesGroupRecurringServiceId: number.optional(),
    billingCycle: number.optional(),
    price: number.optional(),
    effectiveDate: date.optional(),
    nextPrice: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map