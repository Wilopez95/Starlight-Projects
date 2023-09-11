export const serviceInputCommonFieldsPtDefault = {
  noBillableService: false,
  someoneOnSite: false,
  toRoll: false,
  highPriority: false,
  earlyPick: false,
  driverInstructions: (Math.random() + 1).toString(36).substring(7),
  bestTimeToCome: 'any',
  bestTimeToComeFrom: '00:00',
  bestTimeToComeTo: '23:59',
  orderContactId: 198,
  route: null,
  jobSiteId: 99,
  serviceAreaId: 24,
  promoId: null,
  jobSiteContactId: 198,
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  cabOver: false,
  alleyPlacement: false,
  popupNote: null,
  orderRequestMediaUrls: [],
  applySurcharges: true,
  billableServiceApplySurcharges: false,
};
export const deliveryServiceInputPtDefault = {
  billableServiceId: 6,
  materialId: 1,
  equipmentItemId: 2,
  priceId: 129,
  priceGroupId: 96,
  billableServicePrice: 99 * 1_000_000,
};
export const noneServiceInputPtDefault = {
  billableServiceId: 439,
  materialId: 1,
  equipmentItemId: 8,
  priceId: 134,
  priceGroupId: 96,
  billableServicePrice: 200 * 1_000_000,
};
export const liveLoadServiceInputPtDefault = {
  billableServiceId: 1077,
  materialId: 1,
  equipmentItemId: 2,
  priceId: 136,
  priceGroupId: 96,
  billableServicePrice: 50 * 1_000_000,
};
export const switchServiceInputPtDefault = {
  billableServiceId: 490,
  materialId: 16,
  equipmentItemId: 8,
  priceId: 135,
  priceGroupId: 96,
  billableServicePrice: 100 * 1_000_000,
};
export const dumpAndReturnServiceInputPtDefault = {
  billableServiceId: 13,
  materialId: 1,
  equipmentItemId: 2,
  priceId: 130,
  priceGroupId: 96,
  billableServicePrice: 88 * 1_000_000,
};
export const relocateServiceInputPtDefault = {
  billableServiceId: 979,
  materialId: 1,
  equipmentItemId: 2,
  priceId: 137,
  priceGroupId: 96,
  billableServicePrice: 30 * 1_000_000,
};
export const finalServiceInputPtDefault = {
  billableServiceId: 12,
  materialId: 1,
  equipmentItemId: 2,
  billableServicePrice: 99 * 1_000_000,
  priceId: 131,
  priceGroupId: 96,
};

export const orderInputPaymentPtDefault = {
  paymentMethod: 'onAccount',
  sendReceipt: false,
  authorizeCard: false,
  overrideCreditLimit: true,
};

export const orderInputCommonFieldsPtDefault = {
  mediaFiles: [],
  customerId: 1,
  businessUnitId: 1,
  businessLineId: 4,
  commercialTaxesUsed: true,
};
export const updatedPtOrderInputCommonFieldsDefault = {
  driverInstructions: (Math.random() + 1).toString(36).substring(7),
  disposalSiteId: null,
  callOnWayPhoneNumber: null,
  callOnWayPhoneNumberId: null,
  textOnWayPhoneNumber: null,
  textOnWayPhoneNumberId: null,
  projectId: null,
  promoId: null,
  bestTimeToComeFrom: '00:00',
  bestTimeToComeTo: '23:59',
  someoneOnSite: false,
  toRoll: false,
  signatureRequired: false,
  alleyPlacement: false,
  highPriority: false,
  earlyPick: false,
  permitId: null,
  jobSiteContactId: 198,
  orderContactId: 284,
  materialProfileId: null,
  purchaseOrderId: null,
  oneTimePurchaseOrderNumber: null,
  thirdPartyHaulerId: null,
  droppedEquipmentItem: null,
  paymentMethod: 'onAccount',
  notifyDayBefore: null,
  payments: [],
};
export const updatedPtDeliveryOrderInputDefault = {
  ...updatedPtOrderInputCommonFieldsDefault,

  ...deliveryServiceInputPtDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const serviceInputCommonFieldsRoDefault = {
  noBillableService: false,
  someoneOnSite: false,
  toRoll: false,
  highPriority: false,
  earlyPick: false,
  orderContactId: 198,
  driverInstructions: (Math.random() + 1).toString(36).substring(7),
  bestTimeToCome: 'any',
  bestTimeToComeFrom: '00:00',
  bestTimeToComeTo: '23:59',
  route: null,
  applySurcharges: true,
  billableServiceApplySurcharges: true,
  jobSiteId: 46,
  serviceAreaId: 66,
  promoId: null,
  jobSiteContactId: 198,
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  cabOver: false,
  alleyPlacement: false,
  popupNote: null,
  orderRequestMediaUrls: [],
};
export const deliveryServiceInputRoDefault = {
  billableServiceId: 32,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 68,
  priceGroupId: 93,
  billableServicePrice: 99 * 1_000_000,
};
export const generalServiceInputRoDefault = {
  billableServiceId: 39,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 71,
  priceGroupId: 93,
  billableServicePrice: 22 * 1_000_000,
};
export const noneServiceInputRoDefault = {
  billableServiceId: 1740,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 73,
  priceGroupId: 93,
  billableServicePrice: 33 * 1_000_000,
};
export const liveLoadServiceInputRoDefault = {
  billableServiceId: 38,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 72,
  priceGroupId: 93,
  billableServicePrice: 22 * 1_000_000,
};
export const relocateServiceInputRoDefault = {
  billableServiceId: 35,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 74,
  priceGroupId: 93,
  billableServicePrice: 22 * 1_000_000,
};
export const switchServiceInputRoDefault = {
  billableServiceId: 33,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 76,
  priceGroupId: 93,
  billableServicePrice: 44 * 1_000_000,
};
export const dumpAndReturnServiceInputRoDefault = {
  billableServiceId: 37,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 69,
  priceGroupId: 93,
  billableServicePrice: 33 * 1_000_000,
};
export const repositionServiceInputRoDefault = {
  billableServiceId: 36,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 75,
  priceGroupId: 93,
  billableServicePrice: 33 * 1_000_000,
};
export const finalServiceInputRoDefault = {
  billableServiceId: 34,
  materialId: 7,
  equipmentItemId: 5,
  priceId: 70,
  priceGroupId: 93,
  billableServicePrice: 33 * 1_000_000,
};

export const orderInputPaymentRoDefault = {
  paymentMethod: 'onAccount',
  sendReceipt: false,
  authorizeCard: false,
  overrideCreditLimit: true,
};

export const orderInputCommonFieldsRoDefault = {
  mediaFiles: [],
  customerId: 1,
  businessUnitId: 1,
  businessLineId: 1,
  commercialTaxesUsed: true,
};

export const updatedRoOrderInputCommonFieldsDefault = {
  driverInstructions: (Math.random() + 1).toString(36).substring(7),
  disposalSiteId: null,
  callOnWayPhoneNumber: null,
  callOnWayPhoneNumberId: null,
  textOnWayPhoneNumber: null,
  textOnWayPhoneNumberId: null,
  projectId: null,
  promoId: null,
  bestTimeToComeFrom: '00:00',
  bestTimeToComeTo: '23:59',
  someoneOnSite: false,
  toRoll: false,
  signatureRequired: false,
  alleyPlacement: false,
  highPriority: false,
  earlyPick: false,
  permitId: null,
  jobSiteContactId: 198,
  orderContactId: 284,
  materialProfileId: null,
  purchaseOrderId: 102,
  oneTimePurchaseOrderNumber: null,
  thirdPartyHaulerId: null,
  droppedEquipmentItem: null,
  paymentMethod: 'onAccount',
  notifyDayBefore: null,
  payments: [],
};
export const updatedRoDeliveryOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...deliveryServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoGeneralOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...generalServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoNoneOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...noneServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoLiveLoadOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...liveLoadServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoRelocateOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...relocateServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoSwitchOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...switchServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoDumpAndReturnOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...dumpAndReturnServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoRepositionOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...repositionServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};

export const updatedRoFinalOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...finalServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
};
