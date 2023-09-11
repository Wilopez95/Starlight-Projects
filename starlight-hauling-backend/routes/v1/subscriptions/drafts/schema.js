import Joi from 'joi';

import { EQUIPMENT_TYPES } from '../../../../consts/equipmentTypes.js';
import { PAYMENT_METHODS } from '../../../../consts/paymentMethods.js';
import { UPDATE_EVENT_TYPE, UPDATE_EVENT_TYPES } from '../../../../consts/updateEvents.js';
import { SORT_ORDERS } from '../../../../consts/sortOrders.js';
import { BILLABLE_ITEMS_BILLING_CYCLES } from '../../../../consts/billingCycles.js';
import { BILLING_TYPES_VALUES } from '../../../../consts/billingTypes.js';
import { SUBSCRIPTION_SORT_KEYS } from '../../../../consts/subscriptionAttributes.js';
import { commonFilters } from '../schema.js';

const id = Joi.number().integer().positive();
const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern).allow(null);

export const queryParams = commonFilters.keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  customerId: id,

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),

  sortBy: Joi.string()
    .valid(...SUBSCRIPTION_SORT_KEYS)
    .optional(),
});

export const mineOnly = Joi.object().keys({
  mine: Joi.boolean().optional(),
});

export const customerFilter = Joi.object().keys({
  customerId: id,
});

const serviceDayDetails = Joi.object().keys({
  route: Joi.string(),
  requiredByCustomer: Joi.boolean(),
});

export const createSubscriptionDraftData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    customerId: id.required(),
    jobSiteId: id.required(),
    serviceAreaId: id.allow(null),
    // Customer / Job Site Pair Details
    csrComment: Joi.string().allow(null),
    jobSiteNote: Joi.string().allow(null),
    jobSiteContactId: id.allow(null),
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    poRequired: Joi.boolean(),
    purchaseOrderId: id.allow(null),
    permitRequired: Joi.boolean(),
    permitId: id.allow(null),
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
    thirdPartyHaulerId: id.allow(null),
    subscriptionContactId: id.allow(null),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    // Services
    billingCycle: Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES),
    billingType: Joi.string().valid(...BILLING_TYPES_VALUES),
    minBillingPeriods: Joi.number().integer().positive().min(1).max(999).allow(null),
    anniversaryBilling: Joi.boolean().default(false),
    customRatesGroupId: id.allow(null),
    serviceItems: Joi.array().items(
      Joi.object().keys({
        billableServiceId: id.allow(null),
        materialId: id.allow(null),
        globalRatesRecurringServicesId: id.allow(null),
        customRatesGroupServicesId: id.allow(null),
        price: Joi.number().positive().allow(0),
        quantity: Joi.number().positive().allow(null),
        serviceFrequencyId: id.required().allow(null),
        serviceDaysOfWeek: Joi.object()
          .pattern(Joi.number().integer().min(0).max(6), serviceDayDetails)
          .optional(),
        lineItems: Joi.array().items(
          Joi.object().keys({
            billableLineItemId: id.allow(null),
            globalRatesRecurringLineItemsBillingCycleId: id.allow(null),
            customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
            customRatesGroupLineItemsId: id.allow(null),
            price: Joi.number().positive().allow(0),
            quantity: Joi.number().positive().allow(null),
          }),
        ),
        subscriptionOrders: Joi.array().items(
          Joi.object().keys({
            billableServiceId: id.allow(null),
            serviceDate: Joi.date().allow(null),
            globalRatesServicesId: id.allow(null),
            customRatesGroupServicesId: id.allow(null),
            price: Joi.number().positive().allow(0),
            quantity: Joi.number().positive().allow(null),
          }),
        ),
      }),
    ),
    // Payment
    unlockOverrides: Joi.boolean(),
    paymentMethod: Joi.string().valid(...PAYMENT_METHODS),
    // Subscription Summary
    promoId: id.allow(null),
    grandTotal: Joi.number().positive().allow(null),
  })
  .required();

export const editSubscriptionDraftData = Joi.object()
  .keys({
    thirdPartyHaulerId: Joi.number().integer().allow(null),
    serviceAreaId: id.allow(null),
    // Customer / Job Site Pair Details
    jobSiteNote: Joi.string().allow(null),
    jobSiteContactId: id.allow(null),
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    poRequired: Joi.boolean(),
    purchaseOrderId: id.allow(null),
    permitRequired: Joi.boolean(),
    permitId: id.allow(null),
    signatureRequired: Joi.boolean(),
    bestTimeToComeFrom: bestTimeToCome.allow(null),
    bestTimeToComeTo: bestTimeToCome.allow(null),
    alleyPlacement: Joi.boolean(),
    cabOver: Joi.boolean(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    csrComment: Joi.string().allow(null),
    // Subscription Details
    subscriptionContactId: id.allow(null),
    startDate: Joi.date().allow(null),
    endDate: Joi.date().allow(null),
    // Payment
    unlockOverrides: Joi.boolean(),
    // Subscription Summary
    promoId: id.allow(null),
    grandTotal: Joi.number().positive().allow(null),
    customRatesGroupId: id.allow(null),

    billingCycle: Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES),
    billingType: Joi.string().valid(...BILLING_TYPES_VALUES),
    minBillingPeriods: Joi.number().integer().positive().min(1).max(999).allow(null),
    anniversaryBilling: Joi.boolean().default(false),

    serviceItems: Joi.array().items(
      Joi.object().keys({
        eventType: Joi.string()
          .valid(...UPDATE_EVENT_TYPES)
          .required(),
        id: Joi.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.edit, UPDATE_EVENT_TYPE.remove).required(),
          then: id.required(),
        }),
        billableServiceId: id.allow(null),
        materialId: id.allow(null),
        globalRatesRecurringServicesId: id.allow(null),
        customRatesGroupServicesId: id.allow(null),
        price: Joi.number().positive().allow(0),
        quantity: Joi.number().positive().allow(null),
        serviceFrequencyId: id.allow(null),
        serviceDaysOfWeek: Joi.object()
          .pattern(Joi.number().integer().min(0).max(6), serviceDayDetails)
          .optional(),
        lineItems: Joi.array().items(
          Joi.object().keys({
            billableLineItemId: id.allow(null),
            globalRatesRecurringLineItemsBillingCycleId: id.allow(null),
            customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
            price: Joi.number().positive().allow(0),
            quantity: Joi.number().positive().allow(null),
          }),
        ),
        subscriptionOrders: Joi.array().items(
          Joi.object().keys({
            billableServiceId: id.allow(null),
            serviceDate: Joi.date().allow(null),
            globalRatesServicesId: id.allow(null),
            customRatesGroupServicesId: id.allow(null),
            price: Joi.number().positive().allow(0),
            quantity: Joi.number().positive().allow(null),
          }),
        ),
      }),
    ),
    lineItems: Joi.array().items(
      Joi.object().keys({
        eventType: Joi.string()
          .valid(...UPDATE_EVENT_TYPES)
          .required(),
        id: Joi.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.edit, UPDATE_EVENT_TYPE.remove).required(),
          then: id.required(),
        }),
        subscriptionServiceItemId: id.allow(null),
        billableLineItemId: id.allow(null),
        globalRatesRecurringLineItemsBillingCycleId: id.allow(null),
        customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
        price: Joi.number().positive().allow(0),
        quantity: Joi.number().positive().allow(null),
      }),
    ),
    subscriptionOrders: Joi.array().items(
      Joi.object().keys({
        eventType: Joi.string()
          .valid(...UPDATE_EVENT_TYPES)
          .required(),
        id: Joi.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.edit, UPDATE_EVENT_TYPE.remove).required(),
          then: id.required(),
        }),
        subscriptionServiceItemId: id.allow(null),
        billableServiceId: id.allow(null),
        serviceDate: Joi.date().allow(null),
        globalRatesServicesId: id.allow(null),
        customRatesGroupServicesId: id.allow(null),
        price: Joi.number().positive().allow(0),
        quantity: Joi.number().positive().allow(null),
      }),
    ),
  })
  .required();

const requiredIfIsNull = field =>
  Joi.when(field, {
    is: id.required(),
    then: id.allow(null),
  }).concat(
    Joi.when(field, {
      is: null,
      then: id.required(),
    }),
  );

export const updateSubscriptionToActiveData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    customerId: id.required(),
    jobSiteId: id.required(),
    serviceAreaId: id.allow(null),
    // Customer / Job Site Pair Details
    jobSiteNote: Joi.string(),
    jobSiteContactId: id.required(),
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    poRequired: Joi.boolean().required(),
    customerJobSiteId: id.required(),
    purchaseOrderId: id.allow(null),
    permitRequired: Joi.boolean().required(),
    permitId: id,
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
    thirdPartyHaulerId: id.allow(null),
    subscriptionContactId: id.required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().allow(null),
    customRatesGroupId: id.allow(null),

    billingCycle: Joi.string()
      .valid(...BILLABLE_ITEMS_BILLING_CYCLES)
      .required(),
    billingType: Joi.string()
      .valid(...BILLING_TYPES_VALUES)
      .required(),
    minBillingPeriods: Joi.number().integer().positive().min(1).max(999).allow(null),
    anniversaryBilling: Joi.boolean().default(false),

    serviceItems: Joi.array().items(
      Joi.object()
        .keys({
          billableServiceId: id.required(),
          materialId: id.required(),
          globalRatesRecurringServicesId: requiredIfIsNull('customRatesGroupServicesId'),
          customRatesGroupServicesId: id.allow(null),
          price: Joi.number().positive().required().allow(0),
          unlockOverrides: Joi.boolean().default(false),
          quantity: Joi.number().positive().required(),
          billingCycle: Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES),
          serviceFrequencyId: id.required().allow(null),
          serviceDaysOfWeek: Joi.when('serviceFrequencyId', {
            is: id.required(),
            then: Joi.object().pattern(
              Joi.number().integer().min(0).max(6),
              serviceDayDetails.required(),
            ),
          }),
          prorationEffectiveDate: Joi.date(),
          prorationEffectivePrice: Joi.number().min(0),
          prorationOverride: Joi.boolean(),
          lineItems: Joi.array().items(
            Joi.object()
              .keys({
                billableLineItemId: id.required(),
                globalRatesRecurringLineItemsBillingCycleId: requiredIfIsNull(
                  'customRatesGroupRecurringLineItemBillingCycleId',
                ),
                customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
                price: Joi.number().positive().required().allow(0),
                unlockOverrides: Joi.boolean().default(false),
                quantity: Joi.number().positive().required(),
                prorationEffectiveDate: Joi.date().allow(null),
                prorationEffectivePrice: Joi.number().min(0).allow(null),
                prorationOverride: Joi.boolean(),
              })
              .required(),
          ),
          subscriptionOrders: Joi.array().items(
            Joi.object().keys({
              billableServiceId: id.required(),
              serviceDate: Joi.date().required(),
              globalRatesServicesId: requiredIfIsNull('customRatesGroupServicesId'),
              customRatesGroupServicesId: id.allow(null),
              price: Joi.number().positive().required().allow(0),
              unlockOverrides: Joi.boolean().default(false),
              quantity: Joi.number().positive().required(),
            }),
          ),
        })
        .required(),
    ),
    equipmentType: Joi.string()
      .valid(...EQUIPMENT_TYPES, 'multiple')
      .required(),
    // Payment
    unlockOverrides: Joi.boolean(),
    // Subscription Summary
    promoId: id.allow(null),
    overrideCreditLimit: Joi.boolean().default(false).allow(null),
    grandTotal: Joi.number().positive().required().allow(null),
    recurringGrandTotal: Joi.number().positive().required().allow(0),
    periodTo: Joi.date().required(),
    periodFrom: Joi.date().required(),
  })
  .required();
