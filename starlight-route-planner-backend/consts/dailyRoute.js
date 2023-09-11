export const DAILY_ROUTE_STATUS = {
  scheduled: 'SCHEDULED',
  inProgress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  canceled: 'CANCELED',
};

export const DAILY_ROUTE_STATUSES = Object.values(DAILY_ROUTE_STATUS);

export const DAILY_ROUTE_ERRORS = {
  cannotAttachWorkOrders: 'Cannot combine these workOrders in one daily route, please check LOB',
  editInProgress: 'This daily route is currently being edited',
  cannotEnableEditMode: 'This daily route is currently being edited',
  cannotDisableEditMode: 'This user cannot disable edit mode for this daily route',
};

export const DAILY_ROUTE_HISTORICAL_EVENT_TYPE = {
  init: 'init',
  create: 'create',
  delete: 'delete',
  generic: 'generic',
};

export const DAILY_ROUTE_HISTORICAL_EVENT_TYPES = Object.values(DAILY_ROUTE_HISTORICAL_EVENT_TYPE);

export const DAILY_ROUTE_HISTORICAL_ENTITY_TYPE = {
  dailyRoute: 'DAILY_ROUTE',
  weightTicket: 'WEIGHT_TICKET',
};

export const DAILY_ROUTE_HISTORICAL_ENTITY_TYPES = Object.values(
  DAILY_ROUTE_HISTORICAL_ENTITY_TYPE,
);

export const TRACKABLE_DR_HISTORICAL_FIELDS = {
  [DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.dailyRoute]: [
    'name',
    'status',
    'serviceDate',

    'truckId',
    'driverId',
    'driverName',
    'truckType',
    'truckName',
    'completedAt',

    'clockIn',
    'clockOut',
    'odometerStart',
    'odometerEnd',

    'workOrderIds',
  ],
  [DAILY_ROUTE_HISTORICAL_ENTITY_TYPE.weightTicket]: ['ticketNumber'],
};

export const NON_TRACKABLE_DR_HISTORICAL_FIELDS = [
  'id',
  'originalId',
  'eventType',
  'entityType',
  'userId',
  'createdAt',
  'updatedAt',
  'userName',
];
