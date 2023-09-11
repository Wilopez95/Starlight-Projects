export const RECURRENT_TEMPLATE_FREQUENCY_TYPE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  custom: 'custom',
};

export const RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

export const RECURRENT_TEMPLATE_STATUS = {
  active: 'active',
  onHold: 'onHold',
  closed: 'closed',
};

export const RECURRENT_TEMPLATE_SORTING_ATTRIBUTE = {
  startDate: 'startDate',
  id: 'id',
  status: 'status',
  nextServiceDate: 'nextServiceDate',
  grandTotal: 'grandTotal',
};

export const RECURRENT_TEMPLATE_FREQUENCY_TYPES = Object.values(RECURRENT_TEMPLATE_FREQUENCY_TYPE);
export const RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPES = Object.values(
  RECURRENT_TEMPLATE_CUSTOM_FREQUENCY_TYPE,
);
export const RECURRENT_TEMPLATE_STATUSES = Object.values(RECURRENT_TEMPLATE_STATUS);
export const RECURRENT_TEMPLATE_SORTING_ATTRIBUTES = Object.values(
  RECURRENT_TEMPLATE_SORTING_ATTRIBUTE,
);
