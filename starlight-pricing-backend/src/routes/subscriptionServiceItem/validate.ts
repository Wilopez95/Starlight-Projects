import * as Joi from 'joi';
const positiveInt = Joi.number().integer().positive();
const positiveFloat = Joi.number().positive();
const string = Joi.string();
const date = Joi.date();

export const createSubscriptionsServiceItem = Joi.object()
  .keys({
    billingCycle: string.optional(),
    effectiveDate: date.optional(),
    recalculate: Joi.boolean().optional(),
    prorateTotal: Joi.number().optional(),
    serviceFrequencyId: positiveInt.integer().optional().allow(null),
    subscriptionId: positiveInt.integer().positive().required(),
    billableServiceId: positiveInt.integer().optional(),
    globalRatesRecurringServicesId: positiveInt.integer().optional().allow(null),
    customRatesGroupServicesId: positiveInt.integer().optional(),
    materialId: positiveInt.integer().optional(),
    quantity: positiveInt.optional().allow(0),
    price: Joi.number().optional().allow(0),
    nextPrice: Joi.number().optional(),
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

export const bulkCreateSubscriptionsServiceItem = Joi.object().keys({
  data: Joi.array().items(createSubscriptionsServiceItem),
});

export const updateSubscriptionsServiceItem = Joi.object()
  .keys({
    billingCycle: string.optional(),
    effectiveDate: date.optional(),
    recalculate: Joi.boolean().optional(),
    prorateTotal: Joi.number().optional(),
    serviceFrequencyId: positiveInt.optional().allow(null),
    subscriptionId: positiveInt.optional(),
    billableServiceId: positiveInt.optional(),
    globalRatesRecurringServicesId: positiveInt.optional().allow(null),
    customRatesGroupServicesIdFK: positiveInt.optional(),
    materialId: positiveInt.optional(),
    quantity: positiveInt.optional(),
    price: Joi.number().optional().allow(0),
    nextPrice: Joi.number().optional().allow(null),
    endDate: date.optional(),
    isDeleted: Joi.boolean().optional(),
    serviceDaysOfWeek: Joi.object().optional(),
    prorationEffectiveDate: date.optional().allow(null),
    prorationEffectivePrice: Joi.number().optional().allow(null),
    invoicedDate: date.optional(),
    unlockOverrides: Joi.boolean().optional(),
    prorationOverride: Joi.boolean().optional(),
    id: Joi.number().optional(),
  })
  .required();
