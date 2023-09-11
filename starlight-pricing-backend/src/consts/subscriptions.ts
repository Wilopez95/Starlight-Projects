export const EQUIPMENT_TYPE = {
  rollOffContainer: 'rolloff_container',
  wasteContainer: 'waste_container',
  portableToilet: 'portable_toilet',
  unspecified: 'unspecified',
};

export const EQUIPMENT_TYPES = Object.values(EQUIPMENT_TYPE);

export const BILLABLE_ITEMS_BILLING_CYCLE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  '28days': '28days',
  quarterly: 'quarterly',
  yearly: 'yearly',
};

export const BILLABLE_ITEMS_BILLING_CYCLES = Object.values(BILLABLE_ITEMS_BILLING_CYCLE);

export const BILLING_TYPES = {
  arrears: 'arrears',
  inAdvance: 'inAdvance',
};
export const BILLING_TYPES_VALUES = Object.values(BILLING_TYPES);

export const PAYMENT_METHOD = {
  onAccount: 'onAccount',
  creditCard: 'creditCard',
  cash: 'cash',
  check: 'check',
  mixed: 'mixed',
};

export const SUBSCRIPTION_STATUS = {
  active: 'active',
  onHold: 'onHold',
  closed: 'closed',
  draft: 'draft',
};

// Only used in filters
export const NO_PAYMENT = 'noPayment';

export const PAYMENT_METHODS = Object.values(PAYMENT_METHOD);
