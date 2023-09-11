"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsPeriodsSchema = exports.createSubscriptionsPeriodsSchema = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsPeriodsSchema = Joi.object()
    .keys({
    subscriptionId: number.required(),
    priceGroupHistoricalId: number.required(),
    status: string.required(),
    billingCycle: string.required(),
    billingType: string.required(),
    overrideProration: Joi.boolean().optional(),
    recurringServicesAmount: number.optional(),
    recurringServicesProratedAmount: number.optional(),
    recurringServicesOverriddenProratedAmount: number.optional(),
    recurringServicesTotal: number.optional(),
    recurringLineItemsAmount: number.optional(),
    recurringLineItemsOverriddenAmount: number.optional(),
    recurringLineItemsTotal: number.optional(),
    recurringLineItemsOverriddenTotal: number.optional(),
    recurringAmount: number.optional(),
    recurringOverriddenamount: number.optional(),
    recurringTotal: number.optional(),
    recurringOverriddenTotal: number.optional(),
    oneTimeAmount: number.optional(),
    oneTimeOverriddenAmount: number.optional(),
    oneTimeTotal: number.optional(),
    oneTimeOverriddenTotal: number.optional(),
    beforeTaxesGrandTotal: number.optional(),
    beforeTaxesOverriddenGrandTotal: number.optional(),
    grandTotal: number.optional(),
    overriddenGrandTotal: number.optional(),
    nextGrandTotal: number.optional(),
    startAt: date.required(),
    endAt: date.required(),
    invoicedAt: date.required(),
    paidAt: date.required(),
    createdAt: date.required(),
})
    .required();
exports.updateSubscriptionsPeriodsSchema = Joi.object()
    .keys({
    subscriptionId: number.optional(),
    priceGroupHistoricalId: number.optional(),
    status: string.optional(),
    billingCycle: string.optional(),
    billingType: string.optional(),
    overrideProration: Joi.boolean().optional(),
    recurringServicesAmount: number.optional(),
    recurringServicesProratedAmount: number.optional(),
    recurringServicesOverriddenProratedAmount: number.optional(),
    recurringServicesTotal: number.optional(),
    recurringLineItemsAmount: number.optional(),
    recurringLineItemsOverriddenAmount: number.optional(),
    recurringLineItemsTotal: number.optional(),
    recurringLineItemsOverriddenTotal: number.optional(),
    recurringAmount: number.optional(),
    recurringOverriddenAmount: number.optional(),
    recurringTotal: number.optional(),
    recurringOverriddenTotal: number.optional(),
    oneTimeAmount: number.optional(),
    oneTimeOverriddenAmount: number.optional(),
    oneTimeTotal: number.optional(),
    oneTimeOverriddenTotal: number.optional(),
    beforeTaxesGrandTotal: number.optional(),
    beforeTaxesOverriddenGrandTotal: number.optional(),
    grandTotal: number.optional(),
    overriddenGrandTotal: number.optional(),
    nextGrandTotal: number.optional(),
    startAt: date.optional(),
    endAt: date.optional(),
    invoicedAt: date.optional(),
    paidAt: date.optional(),
    createdAt: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map