const servicesFilters = {
  lineItems: {
    getAll: false,
    ids: [],
  },
  services: {
    getAll: false,
    ids: [],
  },
  equipmentItems: {
    getAll: false,
    ids: [],
  },
  materials: {
    getAll: false,
    ids: [],
  },
};

export const baseInput = {
  servicesFilters,
  businessUnitId: 1,
  businessLineId: 1,
  application: 'customers',
  applyTo: 112,
};

export const allIds = [1, 2, 3, 4, 5];

export const baseResult = {
  priceGroupsIds: allIds,
  lineItemIds: [],
  servicesIds: [],
  equipmentItemIds: [],
  materialIds: [],
};
