import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const date = Joi.date();

export const createSubscriptionsLineItem = Joi.object()
  .keys({
    effectiveDate: date.optional(),
    subscriptionServiceItemId: positiveInt.optional(),
    billableLineItemId: Joi.number().optional(),
    globalRatesRecurringLineItemsBillingCycleId: positiveInt.optional(),
    customRatesGroupRecurringLineItemBillingCycleId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    nextPrice: Joi.number().optional(),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: Joi.number().optional(),
    invoicedDate: date.optional(),
  })
  .required();

export const bulkCreateSubscriptionsLineItem = Joi.object().keys({
  data: Joi.array().items(createSubscriptionsLineItem),
});

export const updateSubscriptionsLineItem = Joi.object()
  .keys({
    effectiveDate: date.optional(),
    subscriptionServiceItemId: positiveInt.optional(),
    billableLineItemId: positiveInt.optional(),
    globalRatesRecurringLineItemsBillingCycleId: positiveInt.optional(),
    customRatesGroupRecurringLineItemBillingCycleId: positiveInt.optional(),
    price: Joi.number().optional(),
    quantity: positiveInt.optional(),
    nextPrice: Joi.number().optional(),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: Joi.number().optional().allow(0),
    invoicedDate: date.optional(),
  })
  .required();
