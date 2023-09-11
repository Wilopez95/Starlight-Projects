import Joi from 'joi';

import { NOTIFY_DAY_BEFORE_TYPES } from '../../../consts/notifyDayBefore.js';
import {
  RECURRENT_TEMPLATE_FREQUENCY_TYPE,
  RECURRENT_TEMPLATE_FREQUENCY_TYPES,
  RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE,
  RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES,
  RECURRENT_TEMPLATE_SORTING_ATTRIBUTES,
} from '../../../consts/recurrentOrderTemplates.js';
import { SORT_ORDERS } from '../../../consts/sortOrders.js';
import { GENERATED_ORDERS_ATTRIBUTES } from '../../../consts/generatedOrdersSortingAttributes.js';

const id = Joi.number().integer().positive();
const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern).allow(null);

const searchQuery = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()),
  Joi.string().trim().allow(null),
  Joi.number(),
);

const recurrentOrderTemplate = Joi.object().keys({
  startDate: Joi.date().required(),
  endDate: Joi.date().allow(null),

  projectId: id,
  thirdPartyHaulerId: id.allow(null),
  orderContactId: id.required(),
  materialProfileId: id.allow(null),
  permitId: id,
  disposalSiteId: id.allow(null),
  promoId: id.allow(null),

  customRatesGroupId: id,
  globalRatesServicesId: id.required(),
  customRatesGroupServicesId: id,

  billableServiceId: id.required(),
  equipmentItemId: id.required(),
  materialId: id.required(),
  billableServiceQuantity: Joi.number().positive().max(10).required(),
  billableServicePrice: Joi.number().min(0).required(),

  lineItems: Joi.array()
    .items(
      Joi.object()
        .keys({
          billableLineItemId: id.required(),
          globalRatesLineItemsId: id.required(),
          customRatesGroupLineItemsId: id,
          materialId: id.required().allow(null),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().positive().required(),
          applySurcharges: Joi.boolean().required(),
        })
        .required(),
    )
    .default([]),

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
  jobSiteNote: Joi.string().allow(null),
  driverInstructions: Joi.string().allow(null),
  purchaseOrderId: id.allow(null),
  oneTimePurchaseOrderNumber: Joi.string().allow(null),
  bestTimeToComeFrom: bestTimeToCome,
  bestTimeToComeTo: bestTimeToCome,
  someoneOnSite: Joi.boolean(),
  toRoll: Joi.boolean(),
  highPriority: Joi.boolean(),
  earlyPick: Joi.boolean(),

  notifyDayBefore: Joi.string()
    .valid(...NOTIFY_DAY_BEFORE_TYPES)
    .allow(null),

  frequencyType: Joi.string()
    .valid(...RECURRENT_TEMPLATE_FREQUENCY_TYPES)
    .required(),
  frequencyPeriod: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.number().integer().required(),
  }),
  customFrequencyType: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.string()
      .valid(...RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES)
      .required(),
  }),
  frequencyDays: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.when('customFrequencyType', {
      is: RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.weekly,
      then: Joi.array().items(Joi.number().integer()).required(),
      otherwise: Joi.when('customFrequencyType', {
        is: RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.monthly,
        then: Joi.array().items(Joi.number().integer()).single().max(1).required(),
      }),
    }),
  }),
  unlockOverrides: Joi.boolean().required(),
  // always required since only onaccount for recurrent orders
  grandTotal: Joi.number().min(0).required(),
  applySurcharges: Joi.boolean().required(),
  billableServiceApplySurcharges: Joi.boolean().required(),
});

export const editRecurrentTemplateData = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  endDate: Joi.date().greater('now').allow(null),
  commercialTaxesUsed: Joi.boolean().required(),
  projectId: id.allow(null),
  thirdPartyHaulerId: id.allow(null),
  jobSiteContactId: id.required(),
  orderContactId: id.required(),
  materialProfileId: id.allow(null),
  permitId: id.allow(null),
  disposalSiteId: id.allow(null),
  promoId: id.allow(null),

  customRatesGroupId: id.allow(null),
  globalRatesServicesId: id.required().allow(null),
  customRatesGroupServicesId: id.allow(null),

  billableServiceId: id.required(),
  materialId: id.required(),
  billableServiceQuantity: Joi.number().positive().max(10).required(),
  billableServicePrice: Joi.number().min(0).required(),

  lineItems: Joi.array()
    .items(
      Joi.object()
        .keys({
          billableLineItemId: id.required(),
          globalRatesLineItemsId: id.required(),
          customRatesGroupLineItemsId: id.allow(null),
          materialId: id.required().allow(null),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().positive().required(),
          applySurcharges: Joi.boolean().required(),
        })
        .required(),
    )
    .default([]),

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
  jobSiteNote: Joi.string().allow(null),
  driverInstructions: Joi.string().allow(null),
  purchaseOrderId: id.allow(null),
  oneTimePurchaseOrderNumber: Joi.string().allow(null),
  bestTimeToComeFrom: bestTimeToCome,
  bestTimeToComeTo: bestTimeToCome,
  someoneOnSite: Joi.boolean(),
  toRoll: Joi.boolean(),
  highPriority: Joi.boolean(),
  earlyPick: Joi.boolean(),

  notifyDayBefore: Joi.string()
    .valid(...NOTIFY_DAY_BEFORE_TYPES)
    .allow(null),

  frequencyType: Joi.string()
    .valid(...RECURRENT_TEMPLATE_FREQUENCY_TYPES)
    .required(),
  frequencyPeriod: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.number().integer().required(),
  }),
  customFrequencyType: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.string()
      .valid(...RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES)
      .required(),
  }),
  frequencyDays: Joi.when('frequencyType', {
    is: RECURRENT_TEMPLATE_FREQUENCY_TYPE.custom,
    then: Joi.when('customFrequencyType', {
      is: RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.weekly,
      then: Joi.array().items(Joi.number().integer()).required(),
      otherwise: Joi.when('customFrequencyType', {
        is: RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE.monthly,
        then: Joi.array().items(Joi.number().integer()).single().max(1).required(),
      }),
    }),
  }),
  unlockOverrides: Joi.boolean().required(),
  applySurcharges: Joi.boolean().required(),
  billableServiceApplySurcharges: Joi.boolean().required(),

  // always required since only onaccount for recurrent orders
  grandTotal: Joi.number().min(0).required(),
});

const order = Joi.object().keys({
  jobSite2Id: id,
  projectId: id,
  thirdPartyHaulerId: id.allow(null),
  orderContactId: id.required(),
  materialProfileId: id.allow(null),
  permitId: id,
  disposalSiteId: id.allow(null),
  promoId: id.allow(null),
  serviceDate: Joi.date().required(),

  customRatesGroupId: id,
  globalRatesServicesId: id.required(),
  customRatesGroupServicesId: id,

  billableServiceId: id.required(),
  equipmentItemId: id.required(),
  materialId: id.required(),
  billableServiceQuantity: Joi.number().positive().required(),
  billableServicePrice: Joi.number().min(0).required(),

  lineItems: Joi.array()
    .items(
      Joi.object()
        .keys({
          billableLineItemId: id.required(),
          globalRatesLineItemsId: id.required(),
          customRatesGroupLineItemsId: id,
          materialId: id.required().allow(null),
          price: Joi.number().min(0).required(),
          quantity: Joi.number().positive().required(),
          applySurcharges: Joi.boolean().required(),
        })
        .required(),
    )
    .default([]),

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
  jobSiteNote: Joi.string().allow(null),
  driverInstructions: Joi.string().allow(null),
  purchaseOrderId: id.allow(null),
  bestTimeToComeFrom: bestTimeToCome,
  bestTimeToComeTo: bestTimeToCome,
  someoneOnSite: Joi.boolean(),
  toRoll: Joi.boolean(),
  highPriority: Joi.boolean(),
  earlyPick: Joi.boolean(),
  applySurcharges: Joi.boolean().required(),
  billableServiceApplySurcharges: Joi.boolean().required(),
  notifyDayBefore: Joi.string()
    .valid(...NOTIFY_DAY_BEFORE_TYPES)
    .allow(null),

  // always required since only onaccount for recurrent orders
  grandTotal: Joi.number().min(0).required(),
});

export const pairData = Joi.object().keys({
  poRequired: Joi.boolean().required(),
  permitRequired: Joi.boolean().required(),
  signatureRequired: Joi.boolean().required(),
  alleyPlacement: Joi.boolean().required(),
  cabOver: Joi.boolean().required(),
  popupNote: Joi.string().max(256).allow(null),
});

export const createRecurrentTemplateData = Joi.object().keys({
  businessUnitId: id.required(),
  businessLineId: id.required(),
  customerId: id.required(),
  jobSiteId: id.required(),
  projectId: id.allow(null),
  serviceAreaId: id.allow(null),
  jobSiteContactId: id.required(),
  pair: pairData.required(),
  commercialTaxesUsed: Joi.boolean().required(),
  recurrentTemplateData: recurrentOrderTemplate.required(),
  delivery: order.allow(null),
  final: order.allow(null),
  overrideCreditLimit: Joi.boolean().default(false),
});

export const getRecurrentTemplatesParams = Joi.object()
  .keys({
    customerId: id.required(),
    skip: Joi.number().integer().positive().allow(0),
    limit: Joi.number().integer().positive(),
    query: searchQuery,
    sortOrder: Joi.string()
      .valid(...SORT_ORDERS)
      .optional(),
    sortBy: Joi.string()
      .valid(...RECURRENT_TEMPLATE_SORTING_ATTRIBUTES)
      .optional(),
  })
  .required();

export const getRecurrentTemplateGeneratedOrdersParams = Joi.object().keys({
  skip: Joi.number().integer().positive().allow(0),
  limit: Joi.number().integer().positive(),
  sortOrder: Joi.string()
    .valid(...SORT_ORDERS)
    .optional(),
  sortBy: Joi.string()
    .valid(...GENERATED_ORDERS_ATTRIBUTES)
    .optional(),
});

export const countParams = Joi.object()
  .keys({
    customerId: id.required(),
    query: searchQuery,
  })
  .required();
