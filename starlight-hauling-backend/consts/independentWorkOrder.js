export const INDEPENDENT_WO_STATUS = {
  scheduled: 'SCHEDULED',
  blocked: 'BLOCKED',
  inProgress: 'INPROGRESS',
  completed: 'COMPLETED',
  canceled: 'CANCELED',
};

export const INDEPENDENT_WO_STATUSES = Object.values(INDEPENDENT_WO_STATUS);

export const ORDER_FIELDS_FOR_WOS = [
  'id',
  'workOrderId',
  'independentWorkOrderId',
  'isRollOff',
  'billableServiceId',
  'customerJobSiteId',
  'businessUnitId',
  'businessLineId',
];
