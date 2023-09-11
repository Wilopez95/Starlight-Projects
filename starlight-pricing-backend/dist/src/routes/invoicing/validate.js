"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionOrdersInvoicing = exports.runInvoicingParams = void 0;
const Joi = require("joi");
const BILLABLE_ITEMS_BILLING_CYCLES = ["daily", "weekly", "monthly", "28days", "quarterly", "yearly"];
const id = Joi.number().integer().positive();
exports.runInvoicingParams = Joi.object()
    .keys({
    endingDate: Joi.date().required(),
    customerId: id,
    customerGroupId: id,
    billingCycles: Joi.array()
        .items(...BILLABLE_ITEMS_BILLING_CYCLES)
        .default([])
        .allow(null),
    prepaid: Joi.boolean(),
    onAccount: Joi.boolean(),
})
    .required();
exports.subscriptionOrdersInvoicing = Joi.object()
    .keys({
    businessLineIds: Joi.array().items(Joi.number()),
    billingDate: Joi.date().required(),
    customerId: id,
    customerGroupId: id,
    arrears: Joi.boolean(),
    inAdvance: Joi.boolean(),
    billingCycles: Joi.array()
        .items(...BILLABLE_ITEMS_BILLING_CYCLES)
        .default([])
        .allow(null),
    onAccount: Joi.boolean(),
    prepaid: Joi.boolean(),
})
    .required();
//# sourceMappingURL=validate.js.map