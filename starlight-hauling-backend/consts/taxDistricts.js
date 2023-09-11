export const TAX_KIND = {
  materials: 'materials',
  lineItems: 'lineItems',
  services: 'services',
  recurringServices: 'recurringServices',
  recurringLineItems: 'recurringLineItems',
};

export const TAX_APPLICATION = {
  order: 'order',
  ton: 'ton',
  each: 'each',
  quantity: 'quantity',
  subscription: 'subscription',
};

export const TAX_CALCULATION = {
  percentage: 'percentage',
  flat: 'flat',
};

export const TAX_TYPE = {
  service: 'service',
  material: 'material',
  lineItems: 'lineItems',
  specificLineItem: 'specificLineItem',
  threshold: 'threshold',
};

export const TAX_KINDS = Object.values(TAX_KIND);
export const TAX_APPLICATIONS = Object.values(TAX_APPLICATION);
export const TAX_CALCULATIONS = Object.values(TAX_CALCULATION);
export const TAX_TYPES = Object.values(TAX_TYPE);
