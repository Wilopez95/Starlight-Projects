export enum SubscriptionHistoryActionEnum {
  added = 'added',
  changed = 'changed',
  removed = 'removed',
  other = 'other',
}

export enum SubscriptionHistoryAttributeEnum {
  jobSiteContact = 'jobSiteContact',
  subscriptionContact = 'subscriptionContact',
  purchaseOrder = 'purchaseOrder',
  permit = 'permit',
  thirdPartyHauler = 'thirdPartyHauler',
  customRatesGroup = 'customRatesGroup',
  startDate = 'startDate',
  endDate = 'endDate',
  driverInstructions = 'driverInstructions',
  bestTimeToCome = 'bestTimeToCome',
  highPriority = 'highPriority',
  someoneOnSite = 'someoneOnSite',
  material = 'material',
  unlockOverrides = 'unlockOverrides',
  serviceFrequency = 'serviceFrequency',
  quantity = 'quantity',
  serviceDate = 'serviceDate',
  promo = 'promo',
  annualReminder = 'annualReminder',
  serviceDay = 'serviceDay',
  requiredByCustomer = 'requiredByCustomer',
}

export enum SubscriptionHistoryEntityEnum {
  subscription = 'subscription',
  recurrentService = 'recurrentService',
  recurrentLineItem = 'recurrentLineItem',
  subscriptionOrder = 'subscriptionOrder',
  media = 'media',
}

export enum SubscriptionHistoryEntityAction {
  subscriptionPlaced = 'subscriptionPlaced',
  subscriptionDraftSaved = 'subscriptionDraftSaved',
  putOnHold = 'putOnHold',
  resume = 'resume',
  close = 'close',
  clone = 'clone',
}
