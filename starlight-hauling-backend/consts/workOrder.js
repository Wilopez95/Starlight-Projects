export const DISPATCH_ACTION = {
  delivery: 'SPOT',
  switch: 'SWITCH',
  final: 'FINAL',
  relocate: 'RELOCATE',
  reposition: 'REPOSITION',
  dumpReturn: 'DUMP & RETURN',
  liveLoad: 'LIVE LOAD',
  // pickup: 'PICKUP CAN',
  // dropoff: 'DROPOFF CAN',
  generalPurpose: 'GENERAL PURPOSE',
};

export const NOTE_STATE = {
  startWorkOrder: 'START WORK ORDER',
  arriveOnSite: 'ARRIVE ON SITE',
  signature: 'SIGNATURE',
  startService: 'START SERVICE',
  dropCan: 'DROP CAN',
  pickupCan: 'PICKUP CAN',
  finishService: 'FINISH SERVICE',
  recordWeight: 'RECORD WEIGHT',
  recordWManifests: 'RECORD MANIFESTS',
  goingToFill: 'GOING TO FILL',
  arriveAtFill: 'ARRIVE AT FILL',
  finishDisposal: 'FINISH DISPOSAL',
  recordWeightTickets: 'RECORD WEIGHT TICKETS',
  returningToJobSite: 'RETURNING TO JOBSITE',
  specialInstructions: 'SPECIAL INSTRUCTIONS',

  completeWorkOrder: 'WORK ORDER COMPLETE',
  suspendedWorkOrder: 'SUSPEND WORK ORDER',
  goingToSuspensionSite: 'GOING TO SUSPENSION SITE',
  reassignment: 'REASSIGNMENT',
};

export const LOCATION_TYPE = {
  waypoint: 'WAYPOINT',
  location: 'LOCATION',
  truck: 'TRUCK',
};

export const WO_STATUS = {
  unassigned: 'UNASSIGNED',
  assigned: 'ASSIGNED',
  inProgress: 'INPROGRESS',
  completed: 'COMPLETED',
  canceled: 'CANCELED',
};

export const WO_STATUSES = Object.values(WO_STATUS);

export const SUBSCRIPTION_WO_STATUS = {
  scheduled: 'SCHEDULED',
  inProgress: 'IN_PROGRESS',
  blocked: 'BLOCKED',
  completed: 'COMPLETED',
  // those 2 only for summary logic
  needsApproval: 'NEEDS_APPROVAL',
  approved: 'APPROVED',
  canceled: 'CANCELED',
  // those 2 only for summary logic too
  finalized: 'FINALIZED',
  invoiced: 'INVOICED',
};

export const SUBSCRIPTION_WO_STATUSES = Object.values(SUBSCRIPTION_WO_STATUS);

export const WEIGHT_UNIT = {
  yards: 'yards',
  tons: 'tons',
};

export const WEIGHT_UNITS = Object.values(WEIGHT_UNIT);

export const NOTE_TYPE = {
  note: 'NOTE',
  ticket: 'SCALETICKET',
  manifest: 'MANIFEST',
};

export const NOTE_TYPES = Object.values(NOTE_TYPE);

export const CAN_TRANSACTION_ACTION = {
  dropOff: 'DROPOFF',
};

export const WO_FIELDS_TO_SYNC_WITH_DISPATCH = [
  'id',
  'sequenceId',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'serviceDayOfWeekRequiredByCustomer',
  'status',
  'serviceDate',
  'subscriptionOrderId',
  'assignedRoute',
  'instructionsForDriver',
  'cancellationReason',
  'completedAt',
  'canceledAt',
  'jobSiteNote',
  'signatureRequired',
  'someoneOnSite',
  'toRoll',
  'alleyPlacement',
  'highPriority',
  'poRequired',
  'permitRequired',
  'droppedEquipmentItem',
  'pickedUpEquipmentItem',
];

export const SUBSCRIPTION_WO_SYNC_FROM_ROUTE_PLANNER = [
  'id',
  'subscriptionOrderId',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'status',
  'serviceDate',
  'serviceDayOfWeekRequiredByCustomer',
  'createdAt',
  'updatedAt',
  'completedAt',
  'instructionsForDriver',
  'canceledAt',
  'jobSiteNote',
  'someoneOnSite',
  'highPriority',
  'signatureRequired',
  'toRoll',
  'alleyPlacement',
  'poRequired',
  'permitRequired',
  'cancellationReason',
  'truckNumber',
  'assignedRoute',
  'weight',
  'arrivedAt',
  'driverName',
  'droppedEquipment',
  'pickedUpEquipment',
];

export const INDEPENDENT_WO_FIELDS_SYNC_FROM_ROUTE_PLANNER = [
  'id',
  'orderId',
  'bestTimeToComeFrom',
  'bestTimeToComeTo',
  'status',
  'signatureRequired',
  'someoneOnSite',
  'toRoll',
  'alleyPlacement',
  'highPriority',
  'weight',
];
