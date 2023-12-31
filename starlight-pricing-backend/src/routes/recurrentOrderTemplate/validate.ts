import * as Joi from 'joi';
const string = Joi.string();
const date = Joi.date();
const boolean = Joi.boolean();

const positiveInt = Joi.number().integer().positive();
const id = positiveInt;
const NumberAndZero = Joi.number().integer();
const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const bestTimeToCome = Joi.string().pattern(timePattern);

export const recurrentOrderTemplate = Joi.object().keys({
  startDate: string.required(),
  endDate: string.optional().allow(null),
  businessLineId: positiveInt.required(),
  businessUnitId: positiveInt.required(),
  status: string.required(),
  jobSiteId: positiveInt.required(),
  customerId: positiveInt.required(),
  customerJobSiteId: Joi.number().integer().optional().allow(null),

  projectId: id.optional(),
  thirdPartyHaulerId: id.optional().allow(null),
  orderContactId: id.required(),
  materialProfileId: id.optional().allow(null),
  permitId: id.optional(),
  disposalSiteId: id.optional().allow(null),
  promoId: id.optional().allow(null),
  jobSiteContactId: positiveInt.optional().allow(null),

  customRatesGroupId: NumberAndZero.optional().allow(null),
  globalRatesServicesId: id.required(),
  customRatesGroupServicesId: NumberAndZero.optional().allow(null),

  billableServiceId: id.required(),
  equipmentItemId: id.required(),
  materialId: id.required(),
  billableServiceQuantity: Joi.number().positive().required(),
  billableServicePrice: Joi.number().required(),
  billableServiceTotal: Joi.number().required(),
  billableLineItemsTotal: Joi.number().optional().allow(0),

  lineItems: Joi.array().optional().allow(null),
  callOnWayPhoneNumber: Joi.string().optional().allow(null),
  callOnWayPhoneNumberId: id.optional(),
  textOnWayPhoneNumber: Joi.string().optional().allow(null),
  textOnWayPhoneNumberId: id.optional().allow(null),
  jobSiteNote: Joi.string().optional().allow(null),
  driverInstructions: Joi.string().optional().allow(null),
  purchaseOrderId: id.optional().allow(null),
  oneTimePurchaseOrderNumber: Joi.string().optional(),
  bestTimeToComeFrom: bestTimeToCome.optional().allow(null),
  bestTimeToComeTo: bestTimeToCome.optional().allow(null),
  someoneOnSite: Joi.boolean().optional(),
  toRoll: Joi.boolean().optional(),
  highPriority: Joi.boolean().optional(),
  earlyPick: Joi.boolean().optional(),

  notifyDayBefore: Joi.string().optional().allow(null),
  csrEmail: string.required(),

  frequencyType: Joi.string().optional(),
  frequencyPeriod: positiveInt.optional().allow(null),
  customFrequencyType: Joi.string().optional().allow(null),
  frequencyDays: Joi.array().optional(),
  unlockOverrides: Joi.boolean().optional(),
  beforeTaxesTotal: Joi.number().required(),
  grandTotal: Joi.number().optional(),
  surchargesTotal: Joi.number().positive().optional().allow(0),
  applySurcharges: Joi.boolean().optional(),
  billableServiceApplySurcharges: Joi.boolean().optional().allow(null),
  priceGroupId: positiveInt.optional().allow(null),
  priceId: positiveInt.optional().allow(null),
  serviceAreaId: positiveInt.optional().allow(null),
});

export const updateRecurrentOrderTemplate = Joi.object().keys({
  startDate: string.optional(),
  nextServiceDate: string.optional(),
  endDate: string.optional().allow(null),
  businessLineId: Joi.number().integer().optional(),
  businessUnitId: Joi.number().integer().optional(),
  status: string.optional(),
  jobSiteId: Joi.number().integer().optional(),
  customerId: Joi.number().integer().optional(),
  customerJobSiteId: Joi.number().integer().optional().allow(null),

  projectId: id.optional().allow(null),
  thirdPartyHaulerId: id.optional().allow(null),
  orderContactId: id.optional().allow(null),
  materialProfileId: id.optional().allow(null),
  permitId: id.optional().allow(null),
  disposalSiteId: id.optional().allow(null),
  jobSiteContactId: Joi.number().integer().optional().allow(null),
  promoId: id.optional().allow(null),

  customRatesGroupId: NumberAndZero.optional().allow(null),
  globalRatesServicesId: id.optional().allow(null),
  customRatesGroupServicesId: id.optional().allow(null),

  billableServiceId: id.optional().allow(null),
  equipmentItemId: id.optional().allow(null),
  materialId: id.optional().allow(null),
  billableServiceQuantity: Joi.number().positive().optional(),
  billableServicePrice: Joi.number().optional(),
  billableServiceTotal: Joi.number().optional(),
  billableLineItemsTotal: Joi.number().optional().allow(0),

  lineItems: Joi.array().optional().allow(null),
  callOnWayPhoneNumber: Joi.string().optional().allow(null),
  callOnWayPhoneNumberId: id.optional().allow(null),
  textOnWayPhoneNumber: Joi.string().optional().allow(null),
  textOnWayPhoneNumberId: id.optional().allow(null),
  jobSiteNote: Joi.string().optional().allow(null),
  driverInstructions: Joi.string().optional().allow(null),
  purchaseOrderId: id.optional().allow(null),
  bestTimeToComeFrom: bestTimeToCome.optional().allow(null),
  bestTimeToComeTo: bestTimeToCome.optional().allow(null),
  someoneOnSite: Joi.boolean().optional(),
  toRoll: Joi.boolean().optional(),
  highPriority: Joi.boolean().optional(),
  earlyPick: Joi.boolean().optional(),

  notifyDayBefore: Joi.string().optional().allow(null),
  csrEmail: string.optional().allow(null),

  frequencyType: Joi.string().optional(),
  frequencyPeriod: positiveInt.integer().optional().allow(null),
  customFrequencyType: Joi.string().optional().allow(null),
  frequencyDays: Joi.array().optional().allow(null),
  unlockOverrides: Joi.boolean().optional(),
  beforeTaxesTotal: Joi.number().optional(),
  grandTotal: Joi.number().optional(),
  surchargesTotal: Joi.number().positive().optional().allow(0),
  applySurcharges: Joi.boolean().optional(),
  billableServiceApplySurcharges: Joi.boolean().optional(),
  priceGroupId: positiveInt.optional().allow(null),
  priceId: positiveInt.optional().allow(null),
  serviceAreaId: positiveInt.optional().allow(null),
});

export const createRecurrentOrderTemplate = Joi.object()
  .keys({
    businessLineId: positiveInt.required(),
    businessUnitId: positiveInt.required(),
    status: string.required(),
    serviceAreaId: positiveInt.optional(),
    jobSiteId: positiveInt.required(),
    customerId: positiveInt.required(),
    customerJobSiteId: positiveInt.optional().allow(null),
    projectId: positiveInt.optional(),
    thirdPartyHaulerId: positiveInt.optional(),
    promoId: positiveInt.optional(),
    materialProfileId: id.optional().allow(null),
    jobSiteContactId: positiveInt.optional(),
    orderContactId: positiveInt.optional(),
    permitId: Joi.number().optional(),
    disposalSiteId: Joi.number().optional(),
    customRatesGroupId: NumberAndZero.optional().allow(null),
    globalRatesServicesId: Joi.number().required(),
    customRatesGroupServicesId: Joi.number().optional().allow(0),
    billableServiceId: Joi.number().optional(),
    materialId: Joi.number().optional(),
    equipmentItemId: Joi.number().optional(),
    billableServicePrice: Joi.number().required(),
    billableServiceQuantity: Joi.number().required(),
    billableServiceTotal: Joi.number().required(),
    billableLineItemsTotal: Joi.number().required(),
    thresholdsTotal: Joi.number().required(),
    frequencyType: string.required(),
    frequencyPeriod: Joi.number().optional().allow(null),
    customFrequencyType: string.optional().allow(null),
    frequencyDays: Joi.number().optional(),
    syncDate: date.optional(),
    nextServiceDate: date.optional(),
    unlockOverrides: boolean.required(),
    beforeTaxesTotal: Joi.number().required(),
    grandTotal: Joi.number().required(),
    startDate: date.required(),
    endDate: date.optional(),
    jobSiteNote: string.optional().allow(null),
    callOnWayPhoneNumber: string.optional().allow(null),
    textOnWayPhoneNumber: string.optional().allow(null),
    callOnWayPhoneNumberId: Joi.number().optional().allow(null),
    textOnWayPhoneNumberId: Joi.number().optional().allow(null),
    driverInstructions: string.optional().allow(null),
    bestTimeToComeFrom: string.optional().allow(null),
    bestTimeToComeTo: string.optional().allow(null),
    someoneOnSite: boolean.required(),
    toRoll: boolean.required(),
    highPriority: boolean.required(),
    earlyPick: boolean.required(),
    invoiceNotes: string.optional().allow(null),
    csrEmail: string.required(),
    alleyPlacement: boolean.optional(),
    cabOver: boolean.optional(),
    signatureRequired: boolean.optional(),
    paymentMethod: string.required(),
    notifyDayBefore: string.optional(),
    applySurcharges: boolean.required(),
    billableServiceApplySurcharges: boolean.required(),
    surchargesTotal: Joi.number().optional(),
    commercialTaxesUsed: boolean.required(),
    purchaseOrderId: Joi.number().optional(),
    onHoldEmailSent: boolean.optional().allow(null),
    onHoldNotifySalesRep: boolean.optional().allow(null),
    onHoldNotifyMainContact: boolean.optional().allow(null),

    priceGroupId: Joi.number().optional().allow(null),
    priceId: Joi.number().optional().allow(null),

    lastFailureDate: date.optional(),
    createdAt: date.optional(),
    updatedAt: date.optional(),
  })
  .required();
