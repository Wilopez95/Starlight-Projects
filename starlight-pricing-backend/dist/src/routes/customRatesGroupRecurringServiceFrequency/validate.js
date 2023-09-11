"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomRatesGroupServiceFrecuencySchema = exports.createCustomRatesGroupServiceFrequencySchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createCustomRatesGroupServiceFrequencySchema = Joi.object()
    .keys({
    billableServiceFrequencyId: number.required(),
    customRatesGroupRecurringServiceId: number.required(),
    billingCycle: string.required(),
    price: number.required(),
    effectiveDate: date.optional(),
    nextPrice: number.required(),
    createdAt: date.required(),
    updatedAt: date.required(),
})
    .required();
exports.updateCustomRatesGroupServiceFrecuencySchema = Joi.object()
    .keys({
    billableServiceFrequencyId: number.optional(),
    customRatesGroupRecurringServiceId: number.optional(),
    billingCycle: string.optional(),
    price: number.optional(),
    effectiveDate: date.optional(),
    nextPrice: number.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map