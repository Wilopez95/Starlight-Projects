import Joi from 'joi';

import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { ORDER_SORTING_ATTRIBUTES } from '../../../consts/orderSortingAttributes.js';
import { ORDER_STATUSES, ORDER_STATUS } from '../../../consts/orderStatuses.js';
import { PAYMENT_METHODS, PAYMENT_METHOD, NO_PAYMENT } from '../../../consts/paymentMethods.js';
import { NOTIFY_DAY_BEFORE_TYPES } from '../../../consts/notifyDayBefore.js';
import { PAYMENT_TYPES, PAYMENT_TYPE } from '../../../consts/paymentType.js';
import { PAYMENT_TERMS } from '../../../consts/paymentTerms.js';
import { PAYMENT_STATUSES } from '../../../consts/paymentStatus.js';
import { ORDER_REQUEST_SORTING_ATTRIBUTES } from '../../../consts/orderRequestSortingAttributes.js';

const id = Joi.number().integer().positive();

const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern).required().allow(null);
const materialsFilter = Joi.alternatives(id, 'manifested');
const paymentTermsFilter = Joi.string().valid(...PAYMENT_TERMS);
const paymentMethodsFilter = Joi.string()
  .valid(...PAYMENT_METHODS)
  .allow(NO_PAYMENT)
  .allow(null);

const filters = {
  filterByServiceDateFrom: Joi.date(),
  filterByServiceDateTo: Joi.date(),
  filterByMaterials: Joi.array().single().items(materialsFilter.required()).max(5),
  filterByPaymentTerms: Joi.array().single().items(paymentTermsFilter.required()).unique(),
  filterByWeightTicket: Joi.boolean(),
  filterByBusinessLine: Joi.array().single().items(id.required()).max(5).unique(),
  filterByHauler: Joi.array().single().items(id.required()).max(5).unique(),
  filterByCsr: Joi.array().single().items(Joi.string().required()).max(5).unique(),
  filterByBroker: Joi.array().single().items(id.required()).max(5).unique(),
  filterByPaymentMethod: Joi.array().single().items(paymentMethodsFilter.required()).unique(),
  filterByService: Joi.array().single().items(id.required()).max(5).unique(),
};
const searchQuery = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim().allow(null),
  Joi.number(),
);
export const queryParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),

  sortBy: Joi.string()
    .valid(...ORDER_SORTING_ATTRIBUTES)
    .optional(),

  mine: Joi.boolean().optional(),

  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .optional(),

  finalizedOnly: Joi.when('status', {
    is: Joi.string().valid(ORDER_STATUS.finalized).required(),
    then: Joi.boolean().required().default(false),
  }),
  businessUnitId: id,
  query: searchQuery,
  ...filters,
});

export const createOrderData = Joi.object()
  .keys({
    recycling: Joi.boolean().default(false),
    serviceAreaId: id.allow(null),

    orderRequestId: id.optional(),
    route: Joi.string().allow(null).optional(),
    noBillableService: Joi.boolean().required(),
    notifyDayBefore: Joi.string()
      .valid(...NOTIFY_DAY_BEFORE_TYPES)
      .allow(null),

    jobSiteId: Joi.when('recycling', {
      is: false,
      then: id.required(),
    }),
    jobSite2Id: id,
    projectId: id,

    customRatesGroupId: id,

    equipmentItemId: Joi.when('noBillableService', {
      is: false,
      then: Joi.when('recycling', {
        is: false,
        then: id.required(),
      }),
    }),
    billableServiceId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    materialId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    billableServiceQuantity: Joi.when('noBillableService', {
      is: false,
      then: Joi.number().positive().required(),
    }),
    billableServicePrice: Joi.when('noBillableService', {
      is: false,
      then: Joi.number().min(0).required(),
    }),
    billableServiceApplySurcharges: Joi.when('noBillableService', {
      is: false,
      then: Joi.boolean().required(),
    }),
    droppedEquipmentItem: Joi.when('noBillableService', {
      is: false,
      then: Joi.string(),
    }),
    originDistrictId: Joi.when('recycling', {
      is: true,
      then: id.allow(null),
    }),
    globalRatesServicesId: Joi.when('noBillableService', {
      is: false,
      then: id.allow(null),
    }),
    customRatesGroupServicesId: Joi.when('noBillableService', {
      is: false,
      then: id,
    }),

    serviceDate: Joi.date().required(),

    jobSiteContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    callOnWayPhoneNumber: Joi.string().allow(null),
    callOnWayPhoneNumberId: Joi.when('callOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    textOnWayPhoneNumber: Joi.string().allow(null),
    textOnWayPhoneNumberId: Joi.when('textOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    jobSiteNote: Joi.string(),
    driverInstructions: Joi.string().allow(null),

    permitId: id,
    purchaseOrderId: id.allow(null),
    oneTimePurchaseOrderNumber: Joi.string().allow(null),

    bestTimeToComeFrom: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    bestTimeToComeTo: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    signatureRequired: Joi.boolean().required(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),

    thirdPartyHaulerId: id.allow(null),
    orderContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }),
    materialProfileId: Joi.when('noBillableService', {
      is: false,
      then: id.allow(null),
    }),
    disposalSiteId: id.allow(null),
    promoId: id.allow(null),

    alleyPlacement: Joi.boolean().required(),
    cabOver: Joi.boolean().required(),
    applySurcharges: Joi.boolean().required(),

    poRequired: Joi.boolean().required(),
    permitRequired: Joi.boolean().required(),
    popupNote: Joi.string().max(256).allow(null),

    orderRequestMediaUrls: Joi.array().items(Joi.string()).allow(null).optional(),

    grandTotal: Joi.when('paymentMethod', {
      is: PAYMENT_METHOD.onAccount,
      then: Joi.number().min(0).required(),
    }).allow(null),

    lineItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            billableLineItemId: id.required(),
            materialId: id.required().allow(null),
            globalRatesLineItemsId: id.required(),
            customRatesGroupLineItemsId: id,
            price: Joi.number().min(0).required(),
            quantity: Joi.number().positive().required(),
            applySurcharges: Joi.boolean().required(),
          })
          .required(),
      )
      .default([]),
    thresholds: Joi.when('recycling', {
      is: true,
      then: Joi.array()
        .items(
          Joi.object().keys({
            thresholdId: id.required(),
            globalRatesThresholdsId: id.required().allow(null),
            customRatesGroupThresholdsId: id.allow(null),
            price: Joi.number().min(0).required(),
            quantity: Joi.number().positive().required(),
            applySurcharges: Joi.boolean().required(),
          }),
        )
        .default([]),
    }),
  })
  .required();

export const newCreditCard = Joi.object()
  .keys({
    active: Joi.boolean().required(),
    cardNickname: Joi.string(),

    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().empty('').allow(null).default(null),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zip: Joi.string().min(5).required(),

    nameOnCard: Joi.string().required(),
    expirationDate: Joi.string().max(4).required(),
    cardNumber: Joi.string().required(),
    cvv: Joi.string().min(3).max(4).required(),
    jobSites: Joi.array().items(Joi.number().integer().positive()).allow(null),
  })
  .allow(null);

export const payment = Joi.object().keys({
  paymentMethod: Joi.string()
    .valid(...PAYMENT_METHODS)
    .allow(null)
    .required(),
  overrideCreditLimit: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.onAccount,
    then: Joi.boolean().default(false),
  }).allow(null),
  checkNumber: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.check,
    then: Joi.string().required(),
  }),
  isAch: Joi.when('paymentMethod', {
    is: PAYMENT_TYPE.check,
    then: Joi.boolean().required(),
  }),
  sendReceipt: Joi.boolean().optional().default(false),
  deferredPayment: Joi.boolean().optional().default(false),
  authorizeCard: Joi.boolean().optional().default(false),
  deferredUntil: Joi.when('deferredPayment', {
    is: true,
    then: Joi.date().greater('now').required(),
  }),
  amount: Joi.number().required(),
  creditCardId: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.creditCard,
    then: id,
  }).allow(null),
  newCreditCard: Joi.when('paymentMethod', {
    is: PAYMENT_METHOD.creditCard,
    then: newCreditCard,
  }).allow(null),
});

export const createOrdersData = Joi.object()
  .keys({
    businessUnitId: id.required(),
    businessLineId: id.required(),
    customerId: id.required(),
    commercialTaxesUsed: Joi.boolean().required(),
    orders: Joi.array().items(createOrderData).required().max(10),

    payments: Joi.array().items(payment).required().max(3),
  })
  .required();

export const editedPayment = Joi.object()
  .keys({
    paymentId: id.required(),
    status: Joi.string()
      .required()
      .valid(...PAYMENT_STATUSES),
    deferredUntil: Joi.date().optional().allow(null),
    date: Joi.date().allow(null),
    paymentType: Joi.string()
      .valid(...PAYMENT_TYPES.filter(p => p !== PAYMENT_TYPE.creditMemo), PAYMENT_METHOD.mixed)
      .required(),
    checkNumber: Joi.when('paymentType', {
      is: PAYMENT_TYPE.check,
      then: Joi.string().required(),
    }).allow(null),
    isAch: Joi.when('paymentType', {
      is: PAYMENT_TYPE.check,
      then: Joi.boolean().required(),
    }).allow(null),
    creditCardId: Joi.when('paymentType', {
      is: PAYMENT_TYPE.creditCard,
      then: id,
    }).allow(null),
    newCreditCard: Joi.when('paymentType', {
      is: PAYMENT_TYPE.creditCard,
      then: newCreditCard,
    }).allow(null),
  })
  .required();

export const editOrderData = Joi.object()
  .keys({
    recycling: Joi.boolean().default(false),
    serviceAreaId: id,
    route: Joi.string().allow(null).optional(),
    status: Joi.string()
      .valid(...ORDER_STATUSES)
      .required(),
    noBillableService: Joi.boolean().required(),
    notifyDayBefore: Joi.string()
      .valid(...NOTIFY_DAY_BEFORE_TYPES)
      .allow(null),

    jobSite2Id: id,
    projectId: id.allow(null),

    customRatesGroupId: id.allow(null),

    billableServiceId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),
    materialId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),
    billableServicePrice: Joi.when('noBillableService', {
      is: false,
      then: Joi.number().min(0),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),
    billableServiceApplySurcharges: Joi.when('noBillableService', {
      is: false,
      then: Joi.boolean().required(),
    }),
    droppedEquipmentItem: Joi.when('noBillableService', {
      is: false,
      then: Joi.string().allow(null),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),

    globalRatesServicesId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),
    customRatesGroupServicesId: Joi.when('noBillableService', {
      is: false,
      then: id.allow(null),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),

    serviceDate: Joi.date().required(),

    jobSiteContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),
    callOnWayPhoneNumber: Joi.string().allow(null),
    callOnWayPhoneNumberId: Joi.when('callOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    textOnWayPhoneNumber: Joi.string().allow(null),
    textOnWayPhoneNumberId: Joi.when('textOnWayPhoneNumber', {
      is: Joi.string().required(),
      then: id.required(),
    }),
    driverInstructions: Joi.string().allow(null),

    permitId: id.allow(null),
    purchaseOrderId: id.allow(null),
    oneTimePurchaseOrderNumber: Joi.string().allow(null),

    bestTimeToComeFrom: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    bestTimeToComeTo: Joi.when('noBillableService', {
      is: false,
      then: bestTimeToCome,
    }),
    someoneOnSite: Joi.boolean(),
    toRoll: Joi.boolean(),
    signatureRequired: Joi.boolean(),
    permitRequired: Joi.boolean(),
    highPriority: Joi.boolean(),
    earlyPick: Joi.boolean(),

    thirdPartyHaulerId: id.allow(null),
    orderContactId: Joi.when('noBillableService', {
      is: false,
      then: id.required(),
    }).when('noBillableService', {
      is: true,
      then: Joi.allow(null),
    }),

    materialProfileId: id.allow(null),
    disposalSiteId: id.allow(null),
    promoId: id.allow(null),

    alleyPlacement: Joi.boolean(),
    applySurcharges: Joi.boolean().required(),

    paymentMethod: Joi.string()
      .valid(...PAYMENT_METHODS)
      .allow(null)
      .optional(),
    payments: Joi.when('paymentMethod', {
      is: Joi.string()
        .valid(...PAYMENT_METHODS.filter(p => p !== PAYMENT_METHOD.onAccount))
        .required(),
      then: Joi.array().items(editedPayment).required().min(1).max(3),
    }).allow(null),

    lineItems: Joi.array()
      .items(
        Joi.object()
          .keys({
            id,
            billableLineItemId: id.required(),
            manifestNumber: Joi.string().allow(null),
            materialId: id.required().allow(null),
            globalRatesLineItemsId: id.required(),
            customRatesGroupLineItemsId: id.allow(null),
            price: Joi.number().min(0).required(),
            quantity: Joi.number().positive().required(),
            applySurcharges: Joi.boolean().required(),
          })
          .required(),
      )
      .allow(null),

    thresholds: Joi.array()
      .items(
        Joi.object().keys({
          id: id.required(),
          thresholdId: id,
          threshold: Joi.object().keys({
            id,
            originalId: id,
          }),
          // globalRatesThresholdsId: id.required(),
          // customRatesGroupThresholdsId: id,
          price: Joi.number().min(0).required(),
          quantity: Joi.number().positive().required(),
          applySurcharges: Joi.boolean().required(),
        }),
      )
      .allow(null),
  })
  .required();

export const rescheduleOrderData = Joi.object()
  .keys({
    serviceDate: Joi.date().required(),
    bestTimeToComeFrom: bestTimeToCome,
    bestTimeToComeTo: bestTimeToCome,
    comment: Joi.string().optional().allow(null),
    addTripCharge: Joi.boolean().required().default(true),
    bestTimeToCome: Joi.string().optional().allow(null),
    oldServiceDate: Joi.string().optional().allow(null),
  })
  .required();

export const detailsLevel = Joi.object().keys({
  edit: Joi.boolean().optional(),
  quickView: Joi.boolean().optional(),
});

export const countParams = Joi.object().keys({
  finalizedOnly: Joi.boolean().optional(),
  mine: Joi.boolean().optional(),
  customerId: id.optional(),
  businessUnitId: id,
  query: searchQuery,
  ...filters,
});

export const applyMultiple = Joi.object().keys({
  ids: Joi.array().items(id).default(null).allow(null),
});

export const validOnly = Joi.object().keys({
  validOnly: Joi.boolean().required(),
});

export const droppedCanParams = Joi.object()
  .keys({
    customerId: id.required(),
    jobSiteId: id.required(),
    equipmentItemSize: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  })
  .required();

export const newPrepaidPayment = Joi.object()
  .keys({
    businessUnitId: id.required(),
    refundedPaymentId: id.required(),
    paymentType: Joi.string()
      .valid(...PAYMENT_TYPES)
      .required(),

    date: Joi.date().required(),
    // amount: Joi.number().positive().required(),

    creditCardId: Joi.when('paymentType', {
      is: PAYMENT_TYPE.creditCard,
      then: id,
    }).allow(null),
    newCreditCard: Joi.when('paymentType', {
      is: PAYMENT_TYPE.creditCard,
      then: Joi.object()
        .keys({
          active: Joi.boolean().required(),
          cardNickname: Joi.string(),

          addressLine1: Joi.string().required(),
          addressLine2: Joi.string().empty('').allow(null).default(null),
          city: Joi.string().required(),
          state: Joi.string().required(),
          zip: Joi.string().min(5).required(),

          nameOnCard: Joi.string().required(),
          expirationDate: Joi.string().max(4).required(),
          cardNumber: Joi.string().required(),
          cvv: Joi.string().min(3).max(4).required(),
          // jobSiteId
        })
        .allow(null),
    }).allow(null),

    checkNumber: Joi.when('paymentType', {
      is: PAYMENT_TYPE.check,
      then: Joi.string().required(),
    }).allow(null),
    isAch: Joi.when('paymentType', {
      is: PAYMENT_TYPE.check,
      then: Joi.boolean().required(),
    }).allow(null),
  })
  .required();

export const deleteMediaFileParams = Joi.object()
  .keys({
    deleteFromDispatch: Joi.boolean(),
    isRollOff: Joi.boolean().required(),
    mediaId: Joi.when('isRollOff', {
      is: true,
      then: id,
      otherwise: Joi.string().guid({ version: 'uuidv4' }),
    }).required(),
  })
  .required();

export const paginationParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),

  sortBy: Joi.string()
    .valid(...ORDER_REQUEST_SORTING_ATTRIBUTES)
    .optional(),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
});
