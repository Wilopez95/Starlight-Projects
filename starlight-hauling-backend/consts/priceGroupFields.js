export const priceGroupFields = [
  'id',
  'description',
  'businessUnitId',
  'businessLineId',
  'serviceAreasIds',
  'customerGroupId',
  'customerId',
  'customerJobSiteId',
  'active',
  'validDays',
  'overweightSetting',
  'demurrageSetting',
  'startAt',
  'endAt',
  'dumpSetting',
  'loadSetting',
  'nonServiceHours',
  'isGeneral',
  'createdAt',
  'updatedAt',
];

export const linkedFields = [
  'customerId',
  'customerGroupId',
  'customerJobSiteId',
  'serviceAreasIds',
];

export const PRICE_GROUP_TYPE = {
  customer: 'customer',
  customerGroup: 'customerGroup',
  customerJobSite: 'customerJobSite',
  serviceArea: 'serviceArea',
};

export const PRICE_GROUP_TYPES = Object.values(PRICE_GROUP_TYPE);
