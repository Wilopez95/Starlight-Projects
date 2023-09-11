export const ORDER_STATUS = {
  inProgress: 'inProgress',
  completed: 'completed',
  approved: 'approved',
  finalized: 'finalized',
  canceled: 'canceled',
  invoiced: 'invoiced',
};

export const ORDER_STATUSES = Object.values(ORDER_STATUS);

// need this exact order for sorting purposes
export const SUBSCRIPTION_ORDER_STATUS = {
  scheduled: 'SCHEDULED',
  inProgress: 'IN_PROGRESS',
  blocked: 'BLOCKED',
  skipped: 'SKIPPED',
  completed: 'COMPLETED',
  approved: 'APPROVED',
  canceled: 'CANCELED',
  finalized: 'FINALIZED',
  invoiced: 'INVOICED',
  needsApproval: 'NEEDS_APPROVAL',
};

export const SUBSCRIPTION_ORDER_STATUSES = Object.values(SUBSCRIPTION_ORDER_STATUS);
