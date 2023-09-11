"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionsLineItem = exports.bulkCreateSubscriptionsLineItem = exports.createSubscriptionsLineItem = void 0;
const Joi = require("joi");
const number = Joi.number().integer().positive();
const positiveFloat = Joi.number().positive();
const string = Joi.string();
const date = Joi.date();
exports.createSubscriptionsLineItem = Joi.object()
    .keys({
    effectiveDate: date.optional(),
    subscriptionServiceItemId: number.optional(),
    billableLineItemId: number.optional(),
    globalRatesRecurringLineItemsBillingCycleId: number.optional(),
    customRatesGroupRecurringLineItemBillingCycleId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    nextPrice: number.optional(),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: positiveFloat.optional(),
    invoicedDate: date.optional(),
})
    .required();
exports.bulkCreateSubscriptionsLineItem = Joi.object().keys({
    data: Joi.array().items(exports.createSubscriptionsLineItem),
});
exports.updateSubscriptionsLineItem = Joi.object()
    .keys({
    effectiveDate: date.optional(),
    subscriptionServiceItemId: number.optional(),
    billableLineItemId: number.optional(),
    globalRatesRecurringLineItemsBillingCycleId: number.optional(),
    customRatesGroupRecurringLineItemBillingCycleId: number.optional(),
    price: number.optional(),
    quantity: number.optional(),
    nextPrice: number.optional(),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: positiveFloat.optional(),
    invoicedDate: date.optional(),
})
    .required();
//# sourceMappingURL=validate.js.map