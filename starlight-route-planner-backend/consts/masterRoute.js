export const MASTER_ROUTE_STATUS_ENUM = {
  ACTIVE: 'ACTIVE',
  EDITING: 'EDITING',
  UPDATING: 'UPDATING',
};

export const MASTER_ROUTE_STATUSES = Object.values(MASTER_ROUTE_STATUS_ENUM);

export const MASTER_ROUTE_ERRORS = {
  alreadyPublished: 'Cannot publish already published route',
  truckUnassigned: 'Cannot publish route without assigned truck',
  driverUnassigned: 'Cannot publish route without assigned driver',
  updateInProgress: 'Cannot update master route with in-progress status',
  editInProgress: 'This master route is currently being edited',
  publishingFailed: 'Publishing failed due to errors',
  cannotAttachServiceItems:
    'Cannot combine these serviceItems in one master route, please check LOB',
  serviceDaysDoNotFit: `Service days are required by the customer and do not fit to the service days of the selected master route`,
  cannotEnableEditMode: 'This master route is currently being edited',
  cannotDisableEditMode: 'This user cannot disable edit mode for this master route',
};

export const DEFAULT_DAILY_ROUTES_PUBLISH_OFFSET = 14;

export const MASTER_ROUTE_AL_ENTITIES = [
  'status',
  'editingBy',
  'published',
  'businessLineType',
  'serviceDate',
  'name',
  'truckId',
  'driverId',
  'serviceItems',
];

export const SORTING_COLUMN_MASTER_ROUTES = {
  customerName: 'customerName',
  subscriptionId: 'subscription_id',
  jobSiteName: 'jobSiteName',
  serviceName: 'serviceName',
  serviceFrequencyName: 'service_frequency_id',
  materialName: 'materialName',
  equipmentSize: 'equipmentSize',
  currentRoute: 'master_routes.name',
  currentSequence: 'sequence',
  currentServiceDay: 'service_item_master_route.service_day',
};

export const SORTING_COLUMNS_MASTER_ROUTES = Object.keys(SORTING_COLUMN_MASTER_ROUTES);
