export const SUBSCRIPTION_WO_STATUS = {
  scheduled: 'SCHEDULED',
  inProgress: 'IN_PROGRESS',
  blocked: 'BLOCKED',
  canceled: 'CANCELED',
  completed: 'COMPLETED',
  approved: 'APPROVED',
  finalized: 'FINALIZED',
  invoiced: 'INVOICED',
  deleted: 'DELETED',
};

export const SUBSCRIPTION_WO_STATUSES = Object.values(SUBSCRIPTION_WO_STATUS);

export const WO_STATUS = SUBSCRIPTION_WO_STATUS;
export const WO_STATUSES = SUBSCRIPTION_WO_STATUSES;

export const SORTING_COLUMN = {
  status: 'status',
  assignedRoute: 'assignedRoute',
  completedAt: 'completedAt',
  thirdPartyHaulerDescription: 'thirdPartyHaulerDescription',
  displayId: 'displayId',
  instructionsForDriver: 'instructionsForDriver',
  'comments.id': 'commentId',
  'jobSites.fullAddress': 'fullAddress',
  'workOrdersMedia.id': 'mediaId',
};

export const SORTING_COLUMNS = Object.values(SORTING_COLUMN);

export const WORK_ORDER_ERRORS = {
  editNotAllowed: 'Parent order is invoiced. Edit are not allowed',
};

export const CANCELLATION_REASON = {
  userError: 'userError',
  customerCanceled: 'customerCanceled',
  other: 'other',
};

export const CANCELLATION_REASONS = Object.values(CANCELLATION_REASON);

export const WO_HISTORICAL_EVENT_TYPE = {
  init: 'init',
  create: 'create',
  delete: 'delete',
  generic: 'generic',
};

export const WO_HISTORICAL_ENTITY_TYPE = {
  workOrder: 'WORK_ORDER',
  dailyRoute: 'DAILY_ROUTE',
  media: 'MEDIA',
  comment: 'COMMENT',
};

export const WO_HISTORICAL_ENTITY_TYPES = Object.values(WO_HISTORICAL_ENTITY_TYPE);

export const TRACKABLE_WO_HISTORICAL_FIELDS = {
  [WO_HISTORICAL_ENTITY_TYPE.workOrder]: [
    'assignedRoute',
    'dailyRouteId',
    'serviceDate',
    'completedAt',
    'status',
    'instructionsForDriver',
    'pickedUpEquipment',
    'droppedEquipment',
    'weight',
    'deletedAt',

    // TODO: implement these two
    'jobSiteContactId',
    'phoneNumber',

    'bestTimeToComeFrom',
    'bestTimeToComeTo',
    'alleyPlacement',
    'someoneOnSite',
    'highPriority',
    'signatureRequired',
    'poRequired',
    'permitRequired',
    'toRoll',

    'thirdPartyHaulerId',
    'thirdPartyHaulerDescription',
    'statusLonChange',
    'statusLatChange',
  ],
  [WO_HISTORICAL_ENTITY_TYPE.dailyRoute]: [
    'truckId',
    'driverId',
    'driverName',
    'truckType',
    'truckName',
  ],
  [WO_HISTORICAL_ENTITY_TYPE.media]: ['mediaId', 'url', 'fileName'],
  [WO_HISTORICAL_ENTITY_TYPE.comment]: ['commentId', 'commentEventType', 'comment'],
};

export const NON_TRACKABLE_WO_HISTORICAL_FIELDS = [
  'id',
  'originalId',
  'eventType',
  'entityType',
  'userId',
  'createdAt',
  'updatedAt',
  'userName',
];
