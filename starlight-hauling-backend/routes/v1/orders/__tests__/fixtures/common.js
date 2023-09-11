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
  globalRatesServicesId: 404,
  billableServicePrice: 99,
};
export const noneServiceInputPtDefault = {
  billableServiceId: 439,
  materialId: 16,
  equipmentItemId: 8,
  globalRatesServicesId: 388,
  billableServicePrice: 200,
};
export const liveLoadServiceInputPtDefault = {
  billableServiceId: 1077,
  materialId: 1,
  equipmentItemId: 2,
  globalRatesServicesId: 382,
  billableServicePrice: 50,
};
export const switchServiceInputPtDefault = {
  billableServiceId: 490,
  materialId: 16,
  equipmentItemId: 8,
  globalRatesServicesId: 389,
  billableServicePrice: 100,
};
export const dumpAndReturnServiceInputPtDefault = {
  billableServiceId: 13,
  materialId: 1,
  equipmentItemId: 2,
  globalRatesServicesId: 547,
  billableServicePrice: 88,
};
export const relocateServiceInputPtDefault = {
  billableServiceId: 979,
  materialId: 1,
  equipmentItemId: 2,
  globalRatesServicesId: 383,
  billableServicePrice: 30,
};
export const finalServiceInputPtDefault = {
  billableServiceId: 12,
  materialId: 1,
  equipmentItemId: 2,
  billableServicePrice: 99,
  globalRatesServicesId: 405,
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
  globalRatesServicesId: 609,
  billableServicePrice: 99,
};
export const generalServiceInputRoDefault = {
  billableServiceId: 39,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 582,
  billableServicePrice: 22,
};
export const noneServiceInputRoDefault = {
  billableServiceId: 1740,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 584,
  billableServicePrice: 33,
};
export const liveLoadServiceInputRoDefault = {
  billableServiceId: 38,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 583,
  billableServicePrice: 22,
};
export const relocateServiceInputRoDefault = {
  billableServiceId: 35,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 585,
  billableServicePrice: 22,
};
export const switchServiceInputRoDefault = {
  billableServiceId: 33,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 587,
  billableServicePrice: 44,
};
export const dumpAndReturnServiceInputRoDefault = {
  billableServiceId: 37,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 580,
  billableServicePrice: 33,
};
export const repositionServiceInputRoDefault = {
  billableServiceId: 36,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 586,
  billableServicePrice: 33,
};
export const finalServiceInputRoDefault = {
  billableServiceId: 34,
  materialId: 7,
  equipmentItemId: 5,
  globalRatesServicesId: 581,
  billableServicePrice: 33,
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
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoGeneralOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...generalServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoNoneOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...noneServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoLiveLoadOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...liveLoadServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoRelocateOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...relocateServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoSwitchOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...switchServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoDumpAndReturnOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...dumpAndReturnServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoRepositionOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...repositionServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};

export const updatedRoFinalOrderInputDefault = {
  ...updatedRoOrderInputCommonFieldsDefault,

  ...finalServiceInputRoDefault,

  billableServiceApplySurcharges: true,
  noBillableService: false,
  customRatesGroupServicesId: null,
  customRatesGroupId: null,
};
