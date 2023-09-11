export const baseInput = {
  lineItems: [],
  equipmentItems: [],
  target: '',
  services: [],
  materials: [],
};

export const baseResult = {
  servicesFilters: {
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
  },
  includeNonMaterial: false,
  entityType: null,
};
