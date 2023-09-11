export const SUBSCRIPTION_ATTRIBUTE = {
  jobSiteContact: 'jobSiteContact',
  subscriptionContact: 'subscriptionContact',
  purchaseOrder: 'purchaseOrder',
  permit: 'permit',
  thirdPartyHauler: 'thirdPartyHauler',
  customRatesGroup: 'customRatesGroup',
  startDate: 'startDate',
  endDate: 'endDate',
  driverInstructions: 'driverInstructions',
  bestTimeToComeFrom: 'bestTimeToComeFrom',
  bestTimeToComeTo: 'bestTimeToComeTo',
  highPriority: 'highPriority',
  someoneOnSite: 'someoneOnSite',
  promo: 'promo',
  annualReminder: 'annualReminder',
};

export const SUBSCRIPTION_HISTORY_SORT_PARAMS = {
  id: 'id',
  action: 'action',
  effectiveDate: 'effectiveDate',
  attribute: 'attribute',
  madeBy: 'madeBy',
  createdAt: 'createdAt',
};

export const SUBSCRIPTION_HISTORY_DEFAULT_SORTING = 'id';

export const SUBSCRIPTION_ATTRIBUTES = Object.values(SUBSCRIPTION_ATTRIBUTE);

export const SUBSCRIPTION_HISTORY_SORT_KEYS = Object.keys(SUBSCRIPTION_HISTORY_SORT_PARAMS);
