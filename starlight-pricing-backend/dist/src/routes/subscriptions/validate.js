"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleSearchParams = exports.queryParams = exports.mineOnly = exports.commonFilters = exports.createSubscriptionDraftData = exports.createSubscriptionData = void 0;
const subscriptions_1 = require("../../consts/subscriptions");
const Joi = require("joi");
const subscriptionAttributes_1 = require("../../consts/subscriptionAttributes");
const sortOrders_1 = require("../../consts/sortOrders");
const subscriptionStatuses_1 = require("../../consts/subscriptionStatuses");
const id = Joi.number().integer().positive();
const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern).allow(null);
const positiveFloat = Joi.number().positive();
const serviceDayDetails = Joi.object().keys({
    route: Joi.string(),
    requiredByCustomer: Joi.boolean(),
});
const requiredIfIsNull = (field) => Joi.when(field, {
    is: id.required(),
    then: id.allow(null),
}).concat(Joi.when(field, {
    is: null,
    then: id.required(),
}));
exports.createSubscriptionData = Joi.object()
    .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    customerId: id.required(),
    customerGroupId: id.optional().allow(null),
    csrEmail: Joi.string().required(),
    jobSiteId: id.required(),
    serviceAreaId: id.allow(null),
    // Customer / Job Site Pair Details
    jobSiteNote: Joi.string().allow(null),
    jobSiteContactId: id.required(),
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    csrComment: Joi.string().allow(null),
    poRequired: Joi.boolean().required(),
    purchaseOrderId: id.allow(null),
    customerJobSiteId: id.required(),
    // permitRequired: Joi.boolean().require(),
    permitId: id,
    status: Joi.string().optional(),
    signatureRequired: Joi.boolean().required(),
    bestTimeToComeFrom: bestTimeToCome,
    bestTimeToComeTo: bestTimeToCome,
    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    // Subscription Details
    thirdPartyHaulerId: id.min(0).allow(null),
    subscriptionContactId: id.required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    nextBillingPeriodFrom: Joi.date().allow(null),
    nextBillingPeriodTo: Joi.date().allow(null),
    customRatesGroupId: id.allow(null),
    billingCycle: Joi.string()
        .valid(...subscriptions_1.BILLABLE_ITEMS_BILLING_CYCLES)
        .required(),
    billingType: Joi.string()
        .valid(...subscriptions_1.BILLING_TYPES_VALUES)
        .required(),
    minBillingPeriods: Joi.number().integer().positive().min(1).max(999).allow(null),
    anniversaryBilling: Joi.boolean().default(false),
    serviceItems: Joi.array().items(Joi.object()
        .keys({
        billableServiceId: id.required(),
        materialId: id.required(),
        globalRatesRecurringServicesId: requiredIfIsNull("customRatesGroupServicesId"),
        customRatesGroupServicesId: id.allow(null),
        price: positiveFloat.required().allow(0),
        unlockOverrides: Joi.boolean().default(false),
        quantity: Joi.number().positive().required(),
        billingCycle: Joi.string().valid(...subscriptions_1.BILLABLE_ITEMS_BILLING_CYCLES),
        serviceFrequencyId: id.optional().allow(null),
        serviceDaysOfWeek: Joi.when("serviceFrequencyId", {
            is: id.required(),
            then: Joi.object().pattern(Joi.number().integer().min(0).max(6), serviceDayDetails.required()),
        }),
        prorationEffectiveDate: Joi.date(),
        prorationEffectivePrice: Joi.number().min(0),
        prorationOverride: Joi.boolean(),
        lineItems: Joi.array().items(Joi.object()
            .keys({
            billableLineItemId: id.required(),
            globalRatesRecurringLineItemsBillingCycleId: requiredIfIsNull("customRatesGroupRecurringLineItemBillingCycleId"),
            customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
            price: positiveFloat.required().allow(0),
            unlockOverrides: Joi.boolean().default(false),
            quantity: Joi.number().positive().required(),
            prorationEffectiveDate: Joi.date(),
            prorationEffectivePrice: Joi.number().min(0),
            prorationOverride: Joi.boolean(),
        })
            .required()),
        subscriptionOrders: Joi.array().items(Joi.object().keys({
            billableServiceId: id.required(),
            serviceDate: Joi.date().required(),
            globalRatesServicesId: requiredIfIsNull("customRatesGroupServicesId"),
            customRatesGroupServicesId: id.allow(null),
            price: positiveFloat.required().allow(0),
            unlockOverrides: Joi.boolean().default(false),
            quantity: Joi.number().positive().required(),
            isFinalForService: Joi.boolean(),
        })),
    })
        .required()),
    equipmentType: Joi.string()
        .valid(...subscriptions_1.EQUIPMENT_TYPES, "multiple")
        .required(),
    // serviceFrequency: Joi.string().required(),
    // Payment
    unlockOverrides: Joi.boolean(),
    // Subscription Summary
    promoId: id.allow(null),
    billableServicesTotal: Joi.number().positive().optional().allow(null),
    billableLineItemsTotal: Joi.number().positive().optional().allow(0),
    billableSubscriptionOrdersTotal: Joi.number().positive().optional().allow(0),
    beforeTaxesTotal: Joi.number().positive().optional().allow(null),
    currentSubscriptionPrice: Joi.number().positive().optional().allow(null),
    initialGrandTotal: Joi.number().positive().required().allow(null),
    overrideCreditLimit: Joi.boolean().default(false).allow(null),
    grandTotal: Joi.number().positive().required().allow(null),
    recurringGrandTotal: Joi.number().positive().required(),
    periodTo: Joi.date().required(),
    periodFrom: Joi.date().required(),
    clonedFromSubscriptionId: id.allow(null),
})
    .required();
exports.createSubscriptionDraftData = Joi.object()
    .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    csrEmail: Joi.string().required(),
    customerId: id.required(),
    jobSiteId: id.required(),
    serviceAreaId: id.allow(null),
    csrComment: Joi.string().allow(null),
    // Customer / Job Site Pair Details
    jobSiteNote: Joi.string().allow(null),
    jobSiteContactId: id.allow(null),
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    poRequired: Joi.boolean(),
    purchaseOrderId: id.allow(null),
    permitRequired: Joi.boolean(),
    permitId: id.allow(null),
    status: Joi.string().optional(),
    signatureRequired: Joi.boolean(),
    bestTimeToComeFrom: bestTimeToCome.allow(null),
    bestTimeToComeTo: bestTimeToCome.allow(null),
    alleyPlacement: Joi.boolean(),
    cabOver: Joi.boolean(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    // Competitor
    competitorId: id.allow(null),
    competitorExpirationDate: Joi.date().allow(null),
    // Subscription Details
    thirdPartyHaulerId: id.min(0).allow(null),
    subscriptionContactId: id.allow(null),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    // Services
    billingCycle: Joi.string().valid(...subscriptions_1.BILLABLE_ITEMS_BILLING_CYCLES),
    billingType: Joi.string().valid(...subscriptions_1.BILLING_TYPES_VALUES),
    minBillingPeriods: Joi.number().integer().positive().min(1).max(999).allow(null),
    anniversaryBilling: Joi.boolean().default(false),
    customRatesGroupId: id.allow(null),
    serviceItems: Joi.array().items(Joi.object().keys({
        billableServiceId: id.allow(null),
        materialId: id.allow(null),
        globalRatesRecurringServicesId: id.allow(null),
        customRatesGroupServicesId: id.allow(null),
        price: positiveFloat.allow(0),
        quantity: Joi.number().positive().allow(null),
        serviceFrequencyId: id.optional().allow(null),
        serviceDaysOfWeek: Joi.object().pattern(Joi.number().integer().min(0).max(6), serviceDayDetails).optional(),
        lineItems: Joi.array().items(Joi.object().keys({
            billableLineItemId: id.allow(null),
            globalRatesRecurringLineItemsBillingCycleId: id.allow(null),
            customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
            customRatesGroupLineItemsId: id.allow(null),
            price: positiveFloat.allow(0),
            quantity: Joi.number().positive().allow(null),
        })),
        subscriptionOrders: Joi.array().items(Joi.object().keys({
            billableServiceId: id.allow(null),
            serviceDate: Joi.date().allow(null),
            globalRatesServicesId: id.allow(null),
            customRatesGroupServicesId: id.allow(null),
            price: positiveFloat.allow(0),
            quantity: Joi.number().positive().allow(null),
        })),
    })),
    // Payment
    unlockOverrides: Joi.boolean(),
    paymentMethod: Joi.string().valid(...subscriptions_1.PAYMENT_METHODS),
    // Subscription Summary
    promoId: id.allow(null),
    billableServicesTotal: Joi.number().positive().optional().allow(null),
    billableLineItemsTotal: Joi.number().positive().optional().allow(0),
    initialGrandTotal: Joi.number().positive().optional().allow(null),
    billableSubscriptionOrdersTotal: Joi.number().positive().optional().allow(0),
    beforeTaxesTotal: Joi.number().positive().optional().allow(null),
    grandTotal: Joi.number().positive().allow(null),
})
    .required();
exports.commonFilters = Joi.object().keys({
    businessLine: Joi.array().items(id).max(10).single().optional(),
    startDateFrom: Joi.date().optional(),
    startDateTo: Joi.date().optional(),
    serviceFrequencyId: Joi.array().items(id).max(10).single().optional(),
    billingCycle: Joi.array()
        .items(Joi.string().valid(...subscriptions_1.BILLABLE_ITEMS_BILLING_CYCLES))
        .max(10)
        .single()
        .optional(),
    ratesChanged: Joi.boolean().optional(),
});
exports.mineOnly = Joi.object().keys({
    mine: Joi.boolean().optional(),
});
exports.queryParams = exports.commonFilters.keys({
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    customerId: id,
    mine: Joi.boolean().optional(),
    sortOrder: Joi.string()
        .valid(...sortOrders_1.SORT_ORDERS)
        .optional(),
    sortBy: Joi.string()
        .valid(...subscriptionAttributes_1.SUBSCRIPTION_SORT_KEYS)
        .optional(),
    status: Joi.string()
        .valid(...subscriptionStatuses_1.SUBSCRIPTION_STATUSES)
        .optional(),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    jobSiteId: id,
    serviceAreaId: id,
});
exports.simpleSearchParams = exports.commonFilters.keys({
    businessUnitId: id.required(),
    query: Joi.alternatives(Joi.string(), id).required(),
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    customerId: id,
    mine: Joi.boolean().optional(),
    sortOrder: Joi.string()
        .valid(...sortOrders_1.SORT_ORDERS)
        .optional(),
    sortBy: Joi.string()
        .valid(...subscriptionAttributes_1.SUBSCRIPTION_SORT_KEYS)
        .optional(),
    status: Joi.string()
        .valid(...subscriptionStatuses_1.SUBSCRIPTION_STATUSES)
        .optional(),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    jobSiteId: id,
    serviceAreaId: id,
});
//# sourceMappingURL=validate.js.map