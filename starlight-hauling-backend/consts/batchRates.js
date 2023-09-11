export const BATCH_RATES_SOURCE = {
  global: 'global',
  current: 'current',
};

export const BATCH_UPDATE_TARGET = {
  all: 'all',
  services: 'services',
  lineItems: 'lineItems',
  recurringServices: 'recurringServices',
  recurringLineItems: 'recurringLineItems',
};

export const BATCH_RATES_APPLICATION = {
  customerJobSites: 'customerJobSites',
  customers: 'customers',
  customerGroups: 'customerGroups',
  specificPriceGroups: 'specificPriceGroups',
  serviceAreas: 'serviceAreas',
};

export const BATCH_RATES_CALCULATION = {
  percentage: 'percentage',
  flat: 'flat',
};

export const APPLICATION_TO_LINKED_FIELDS = {
  customers: 'customerId',
  customerGroups: 'customerGroupId',
  customerJobSites: 'customerJobSiteId',
};

export const BATCH_ENTITY = {
  all: '',
  services: 'ONE_TIME_SERVICE',
  recurringServices: 'RECURRING_SERVICE',
  lineItems: 'ONE_TIME_LINE_ITEM',
  recurringLineItems: 'RECURRING_LINE_ITEM',
};

export const INCLUDE_NONE_MATERIAL = 'INCLUDE_NONE_MATERIAL';
export const INCLUDE_ALL = 'INCLUDE_ALL';

export const BATCH_RATES_SOURCES = Object.values(BATCH_RATES_SOURCE);
export const BATCH_RATES_CALCULATIONS = Object.values(BATCH_RATES_CALCULATION);
export const BATCH_RATES_APPLICATIONS = Object.values(BATCH_RATES_APPLICATION);
export const BATCH_UPDATE_TARGETS = Object.values(BATCH_UPDATE_TARGET);
