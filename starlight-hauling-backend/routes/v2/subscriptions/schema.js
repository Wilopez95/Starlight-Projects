import Joi from 'joi';

import { SUBSCRIPTION_STATUSES } from '../../../consts/subscriptionStatuses.js';
import { EQUIPMENT_TYPES } from '../../../consts/equipmentTypes.js';
import { SORT_ORDERS, SORT_ORDER } from '../../../consts/sortOrders.js';
import {
  SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTES,
  SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTE,
} from '../../../consts/orderSortingAttributes.js';
import { UPDATE_EVENT_TYPE, UPDATE_EVENT_TYPES } from '../../../consts/updateEvents.js';
import {
  BILLABLE_ITEMS_BILLING_CYCLES,
  MAX_BILLING_CYCLE_COUNT,
  ALLOWED_BILLING_CYCLE_FOR_PRORATION,
} from '../../../consts/billingCycles.js';
import { BILLING_TYPES_VALUES } from '../../../consts/billingTypes.js';
import {
  SUBSCRIPTION_SORT_KEYS,
  SUBSCRIPTION_ORDERS_SORT_KEYS,
  SUBSCRIPTION_ORDERS_DEFAULT_SORTING,
} from '../../../consts/subscriptionAttributes.js';
import { PRORATION_TYPES } from '../../../consts/prorationTypes.js';
import { SUBSCRIPTION_ORDER_STATUSES } from '../../../consts/orderStatuses.js';

const id = Joi.number().integer().positive();
const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern).allow(null);

export const commonFilters = Joi.object().keys({
  businessLine: Joi.array().items(id).max(10).single().optional(),
  startDateFrom: Joi.date().optional(),
  startDateTo: Joi.date().optional(),
  serviceFrequencyId: Joi.array().items(id).max(10).single().optional(),
  billingCycle: Joi.array()
    .items(Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES))
    .max(10)
    .single()
    .optional(),
  ratesChanged: Joi.boolean().optional(),
});

export const simpleSearchParams = commonFilters
  .keys({
    businessUnitId: id.required(),
    query: Joi.alternatives(Joi.string(), id).required(),
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    status: Joi.string()
      .valid(...SUBSCRIPTION_STATUSES)
      .optional(),
    customerId: id,
  })
  .required();

export const queryParams = commonFilters.keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  customerId: id,
  mine: Joi.boolean().optional(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),

  sortBy: Joi.string()
    .valid(...SUBSCRIPTION_SORT_KEYS)
    .optional(),

  status: Joi.string()
    .valid(...SUBSCRIPTION_STATUSES)
    .optional(),

  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),

  jobSiteId: id,
  serviceAreaId: id,
});

export const mineOnly = Joi.object().keys({
  mine: Joi.boolean().optional(),
});

export const customerFilter = Joi.object().keys({
  customerId: id,
});

export const subscriptionOrderWorkOrdersListQuery = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTES)
    .optional()
    .default(SUBSCRIPTION_WORK_ORDER_SORTING_ATTRIBUTE.serviceDate),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional()
    .default(SORT_ORDER.asc),
});

const serviceDayDetails = Joi.object().keys({
  route: Joi.string(),
  requiredByCustomer: Joi.boolean(),
});

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

export const createSubscriptionData = Joi.object()
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
    csrComment: Joi.string().allow(null),
    poRequired: Joi.boolean().required(),
    purchaseOrderId: Joi.when('poRequired', {
      is: true,
      then: id.required(),
      otherwise: id.allow(null),
    }),
    customerJobSiteId: id.required(),
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
                price: Joi.number().positive().required(),
                unlockOverrides: Joi.boolean().default(false),
                quantity: Joi.number().positive().required(),
                prorationEffectiveDate: Joi.date(),
                prorationEffectivePrice: Joi.number().min(0),
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
              isFinalForService: Joi.boolean(),
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
    recurringGrandTotal: Joi.number().positive().required(),
    periodTo: Joi.date().required(),
    periodFrom: Joi.date().required(),
  })
  .required();

export const editSubscriptionData = Joi.object()
  .keys({
    customerId: id, // get creditLimit

    jobSiteContactId: id,
    jobSiteContactTextOnly: Joi.boolean(),
    driverInstructions: Joi.string().allow(null),
    csrComment: Joi.string().allow(null),
    purchaseOrderId: id.allow(null),
    permitId: id.allow(null),
    bestTimeToComeFrom: bestTimeToCome,
    bestTimeToComeTo: bestTimeToCome,
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),
    thirdPartyHaulerId: id.allow(null),
    subscriptionContactId: id,
    startDate: Joi.date(),
    endDate: Joi.date().allow(null),
    onHold: Joi.boolean().optional(),
    offHold: Joi.boolean().optional(),
    reason: Joi.when('onHold', {
      is: true,
      then: Joi.string().required(),
    }),
    reasonDescription: Joi.when('onHold', {
      is: true,
      then: Joi.string().allow(null).optional(),
    }),
    holdSubscriptionUntil: Joi.when('onHold', {
      is: true,
      then: Joi.date().allow(null).optional(),
    }),
    serviceFrequencyId: id.allow(null),
    serviceDaysOfWeek: Joi.when('serviceFrequencyId', {
      is: id.required(),
      then: Joi.object().pattern(Joi.number().integer().min(0).max(6), Joi.string()),
    }),
    unlockOverrides: Joi.boolean(),
    promoId: id.allow(null),
    customRatesGroupId: id.allow(null),
    serviceItems: Joi.array().items(
      Joi.object().keys({
        eventType: Joi.string()
          .valid(...UPDATE_EVENT_TYPES)
          .required(),
        id: Joi.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.edit, UPDATE_EVENT_TYPE.remove).required(),
          then: id.required(),
        }),
        billableServiceId: Joi.when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: id.required(),
        }),
        materialId: Joi.when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: id.required(),
        }),
        price: Joi.number()
          .positive()
          .allow(0)
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().allow(0).required(),
          }),
        unlockOverrides: Joi.boolean(),
        quantity: Joi.number()
          .positive()
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().required(),
          }),
        globalRatesRecurringServicesId: id.allow(null).when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: requiredIfIsNull('customRatesGroupServicesId'),
        }),
        customRatesGroupServicesId: id.allow(null),
        effectiveDate: Joi.date()
          .allow(null)
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.edit).required(),
            then: Joi.date().allow(null).required(),
          }),
        serviceFrequencyId: id.allow(null),
        serviceDaysOfWeek: Joi.when('serviceFrequencyId', {
          is: id.required(),
          then: Joi.object().pattern(
            Joi.number().integer().min(0).max(6),
            serviceDayDetails.required(),
          ),
        }),
        billingCycle: Joi.string().valid(...BILLABLE_ITEMS_BILLING_CYCLES),
        lineItems: Joi.array().items(
          Joi.object().keys({
            billableLineItemId: id.required(),
            globalRatesRecurringLineItemsBillingCycleId: requiredIfIsNull(
              'customRatesGroupRecurringLineItemBillingCycleId',
            ),
            customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
            price: Joi.number().positive().required().allow(0),
            unlockOverrides: Joi.boolean(),
            quantity: Joi.number().positive().required(),
          }),
        ),
        subscriptionOrders: Joi.array().items(
          Joi.object().keys({
            billableServiceId: id.required(),
            serviceDate: Joi.date().required(),
            globalRatesServicesId: requiredIfIsNull('customRatesGroupServicesId'),
            customRatesGroupServicesId: id.allow(null),
            price: Joi.number().positive().required().allow(0),
            unlockOverrides: Joi.boolean(),
            quantity: Joi.number().positive().required(),
            isFinalForService: Joi.boolean(),
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
        effectiveDate: Joi.date(),
        subscriptionServiceItemId: Joi.when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: id.required(),
        }),
        billableLineItemId: id.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
          then: id.required(),
        }),
        globalRatesRecurringLineItemsBillingCycleId: id.allow(null).when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: requiredIfIsNull('customRatesGroupRecurringLineItemBillingCycleId'),
        }),
        customRatesGroupRecurringLineItemBillingCycleId: id.allow(null),
        price: Joi.number()
          .positive()
          .allow(0)
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().allow(0).required(),
          }),
        unlockOverrides: Joi.boolean(),
        quantity: Joi.number()
          .positive()
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().required(),
          }),
      }),
    ),
    subscriptionOrders: Joi.array().items(
      Joi.object().keys({
        eventType: Joi.string()
          .valid(...UPDATE_EVENT_TYPES)
          .required(),
        id: Joi.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.edit).required(),
          then: id.required(),
        }),
        billableServiceId: id.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
          then: id.required(),
        }),
        subscriptionServiceItemId: id.when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
          then: id.required(),
        }),
        serviceDate: Joi.date().when('eventType', {
          is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
          then: Joi.date().required(),
        }),
        globalRatesServicesId: id.allow(null).when('eventType', {
          is: UPDATE_EVENT_TYPE.add,
          then: requiredIfIsNull('customRatesGroupServicesId'),
        }),
        customRatesGroupServicesId: id.allow(null),
        price: Joi.number()
          .positive()
          .allow(0)
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().allow(0).required(),
          }),
        unlockOverrides: Joi.boolean(),
        quantity: Joi.number()
          .positive()
          .when('eventType', {
            is: Joi.string().valid(UPDATE_EVENT_TYPE.add).required(),
            then: Joi.number().positive().required(),
          }),
        isFinalForService: Joi.boolean(),
      }),
    ),
    overrideCreditLimit: Joi.boolean().default(false).allow(null),
    grandTotal: Joi.number().positive().required().allow(null),
    recurringGrandTotal: Joi.number().positive().required(),
  })
  .required();

export const subscriptionOrdersListQuery = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...SUBSCRIPTION_ORDERS_SORT_KEYS)
    .optional()
    .default(SUBSCRIPTION_ORDERS_DEFAULT_SORTING),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional()
    .default(SORT_ORDER.desc),

  filterByServiceDateFrom: Joi.date().allow(null),
  filterByServiceDateTo: Joi.date().allow(null),
  needsApproval: Joi.boolean().optional(),
  completed: Joi.boolean().optional(),
  oneTime: Joi.boolean().optional(),
});

export const subscriptionServiceItemsListQuery = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
});

export const subscriptionOrderData = Joi.object().keys({
  customerId: id, // get creditLimit

  businessLineId: id.required(),
  destinationJobSiteId: id.allow(null).optional(),
  serviceDate: Joi.date().required(),
  assignedRoute: Joi.string().allow(null).required(),
  globalRatesServicesId: Joi.when('customRatesGroupServicesId', {
    is: id.required(),
    then: id.allow(null),
  }).concat(
    Joi.when('customRatesGroupServicesId', {
      is: null,
      then: id.required(),
    }),
  ),
  status: Joi.valid(...SUBSCRIPTION_ORDER_STATUSES).optional(),
  customRatesGroupServicesId: id.optional(),
  customRatesGroupId: id.allow(null).optional(),
  price: Joi.number().positive().allow(0),
  quantity: Joi.number().positive(),
  materialId: Joi.when('billableServiceId', {
    is: id.exist(),
    then: id.required(),
  }),
  callOnWayPhoneNumber: Joi.string().allow(null),
  textOnWayPhoneNumber: Joi.string().allow(null),
  alleyPlacement: Joi.boolean(),

  billableServiceId: id.allow(null),
  lineItems: Joi.array().items(
    Joi.object().keys({
      billableLineItemId: id.required(),
      globalRatesLineItemsId: id.required(),
      customRatesGroupLineItemsId: id.allow(null),
      materialId: id.allow(null).optional(),
      price: Joi.number().positive().required(),
      quantity: Joi.number().positive().required(),
      unlockOverrides: Joi.boolean(),
    }),
  ),
  surcharges: Joi.array()
    .items(
      Joi.object().keys({
        billableLineItemId: id.allow(null),
        billableServiceId: id.allow(null),
        customRatesGroupSurchargesId: id.allow(null),
        globalRatesSurchargesId: id.required(),
        materialId: id.allow(null),
        surchargeId: id.required(),
        amount: Joi.number().positive().required(),
        quantity: Joi.number().positive().required(),
      }),
    )
    .default([]),

  // Customer / Job Site Pair Details
  jobSiteNote: Joi.string(),
  jobSiteContactId: id.required(),
  jobSiteContactTextOnly: Joi.boolean(),
  instructionsForDriver: Joi.string().allow(null),
  purchaseOrderId: id.allow(null),
  oneTimePurchaseOrderNumber: Joi.string().allow(null),
  permitId: id,
  signatureRequired: Joi.boolean().required(),
  bestTimeToComeFrom: bestTimeToCome,
  bestTimeToComeTo: bestTimeToCome,

  highPriority: Joi.boolean(),
  earlyPick: Joi.boolean(),
  someoneOnSite: Joi.boolean(),
  toRoll: Joi.boolean(),
  // Subscription Details
  thirdPartyHaulerId: id.allow(null),
  subscriptionContactId: id.required(),
  // Payment
  unlockOverrides: Joi.boolean(),
  // Subscription Summary
  promoId: id.allow(null),
  overrideCreditLimit: Joi.boolean().default(false).allow(null),
  grandTotal: Joi.number().positive().required().allow(null),
  droppedEquipmentItem: Joi.string().allow(null),
  pickedUpEquipmentItem: Joi.string().allow(null),
});

export const calculateSummary = Joi.object().keys({
  billingCycle: Joi.string()
    .valid(...ALLOWED_BILLING_CYCLE_FOR_PRORATION)
    .required(),
  anniversaryBilling: Joi.boolean().default(false),
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),
  includeInvoiced: Joi.boolean().default(false),
  billingCycleCount: Joi.number().positive().default(2).max(MAX_BILLING_CYCLE_COUNT).min(2),

  serviceItems: Joi.array()
    .items(
      Joi.object()
        .keys({
          serviceItemId: id.allow(0),
          price: Joi.number().positive().allow(0).required(),
          quantity: Joi.number().positive().required(),
          prorationType: Joi.string().valid(...PRORATION_TYPES),
          effectiveDate: Joi.date().allow(null),

          serviceFrequencyId: id.required().allow(null),
          billableServiceId: id.allow(null),
          serviceDaysOfWeek: Joi.when('serviceFrequencyId', {
            is: id.required(),
            then: Joi.object().pattern(
              Joi.number().integer().min(0).max(6),
              serviceDayDetails.required(),
            ),
          }),
          lineItems: Joi.array().items(
            Joi.object().keys({
              lineItemId: id.allow(0),
              price: Joi.number().positive().allow(0).required(),
              quantity: Joi.number().positive().required(),
              effectiveDate: Joi.date(),
              billableLineItemId: id.allow(null),
            }),
          ),

          subscriptionOrders: Joi.array().items(
            Joi.object().keys({
              price: Joi.number().positive().allow(0).required(),
              quantity: Joi.number().positive().required(),
              serviceDate: Joi.date().required(),
              billableServiceId: id.allow(0),
            }),
          ),
        })
        .required(),
    )
    .required(),
});

export const calculatePricesSchema = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  billingCycle: Joi.string()
    .valid(...ALLOWED_BILLING_CYCLE_FOR_PRORATION)
    .required(),
  anniversaryBilling: Joi.boolean().default(false),
  customRatesGroupId: id.allow(null).default(null),
  startDate: Joi.date().allow(null),
  endDate: Joi.date().allow(null),
  includeInvoiced: Joi.boolean().default(false),
  jobSiteId: id.allow(null),
  applySurcharges: Joi.boolean().default(false),
  needRecalculateSurcharge: Joi.boolean().default(false),
  customerId: id.required(),
  customerJobSiteId: id.required().allow(null),

  serviceItems: Joi.array()
    .items(
      Joi.object().keys({
        serviceItemId: id.allow(null),
        billableServiceId: id.allow(null),
        materialId: id.allow(null),
        serviceFrequencyId: id.allow(null),
        price: Joi.number().positive().allow(0).allow(null).default(0),
        // In case of click on end service, quantity will be 0
        quantity: Joi.number().positive().allow(0),
        prorationType: Joi.string()
          .valid(...PRORATION_TYPES)
          .allow(null),
        effectiveDate: Joi.date().allow(null),
        applySurcharges: Joi.boolean().default(false),
        unlockOverrides: Joi.boolean().default(false),
        serviceDaysOfWeek: Joi.when('serviceFrequencyId', {
          is: id.required(),
          then: Joi.object().pattern(
            Joi.number().integer().min(0).max(6),
            serviceDayDetails.required(),
          ),
        }),

        lineItems: Joi.array().items(
          Joi.object().keys({
            lineItemId: id.allow(null),
            billableLineItemId: id.allow(null),
            price: Joi.number().positive().allow(0).allow(null).default(0),
            quantity: Joi.number().positive(),
            effectiveDate: Joi.date().allow(null),
            unlockOverrides: Joi.boolean().default(false),
            applySurcharges: Joi.boolean().default(false),
          }),
        ),

        subscriptionOrders: Joi.array().items(
          Joi.object().keys({
            subscriptionOrderId: id.allow(null),
            billableServiceId: id.required().allow(null),
            serviceDate: Joi.date().allow(null),
            price: Joi.number().positive().allow(0).allow(null).default(0),
            quantity: Joi.number().positive(),
            unlockOverrides: Joi.boolean().default(false),
            applySurcharges: Joi.boolean().default(false),
          }),
        ),
      }),
    )
    .required(),
});

export const onHoldSubscriptionData = Joi.object().keys({
  updateOnly: Joi.boolean().required(),
  reason: Joi.string().required(),
  reasonDescription: Joi.string().allow(null),
  holdSubscriptionUntil: Joi.date().allow(null),
});

export const applyProrationChange = Joi.object().keys({
  serviceItems: Joi.array().items(
    Joi.object().keys({
      id: id.required(),
      prorationEffectiveDate: Joi.date().required().allow(null),
      prorationEffectivePrice: Joi.number().min(0).allow(null).required(),
      prorationOverride: Joi.boolean(),
      lineItems: Joi.array().items(
        Joi.object()
          .keys({
            id: id.required(),
            prorationEffectiveDate: Joi.date().required().allow(null),
            prorationEffectivePrice: Joi.number().min(0),
            prorationOverride: Joi.boolean(),
          })
          .required(),
      ),
    }),
  ),
});

export const getSubscriptionsTotal = Joi.object().keys({
  schemaName: Joi.string().required(),
  customerId: id.required(),
});
