"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsServiceItem = exports.bulkCreateSubscriptionsServiceItem = exports.createSubscriptionsServiceItem = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const positiveFloat = Joi.number().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsServiceItem = Joi.object()
    .keys({
    billingCycle: string.optional(),
    effectiveDate: date.optional(),
    recalculate: Joi.boolean().optional(),
    prorateTotal: number.optional(),
    serviceFrequencyId: number.optional().allow(null),
    subscriptionId: number.required(),
    billableServiceId: number.optional(),
    globalRatesRecurringServicesId: number.optional().allow(null),
    customRatesGroupServicesId: number.optional(),
    materialId: number.optional(),
    quantity: number.optional().allow(0),
    price: positiveFloat.optional().allow(0),
    nextPrice: number.optional(),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    serviceDaysOfWeek: Joi.object().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: positiveFloat.optional().allow(null),
    invoicedDate: date.optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
})
    .required();
exports.bulkCreateSubscriptionsServiceItem = Joi.object().keys({
    data: Joi.array().items(exports.createSubscriptionsServiceItem),
});
exports.updateSubscriptionsServiceItem = Joi.object()
    .keys({
    billingCycle: string.optional(),
    effectiveDate: date.optional(),
    recalculate: Joi.boolean().optional(),
    prorateTotal: number.optional(),
    serviceFrequencyId: number.optional().allow(null),
    subscriptionId: number.optional(),
    billableServiceId: number.optional(),
    globalRatesRecurringServicesId: number.optional().allow(null),
    customRatesGroupServicesIdFK: number.optional(),
    materialId: number.optional(),
    quantity: number.optional(),
    price: number.optional().allow(0),
    nextPrice: number.optional().allow(null),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    serviceDaysOfWeek: Joi.object().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: Joi.number().optional().allow(null),
    invoicedDate: date.optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
})
    .required();
//# sourceMappingURL=validate.js.map