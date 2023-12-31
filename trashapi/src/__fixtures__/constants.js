export const CAN_ACTION = {
  MOVE: 'MOVE',
  PICKUP: 'PICKUP',
  DROPOFF: 'DROPOFF',
  TRANSFER: 'TRANSFER',
  NOTE: 'NOTE',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
  CREATE: 'CREATE',
};

export const CAN_SIZE = ['10', '20', '30', '40'];
export const CAN = { ...CAN_ACTION, ...CAN_SIZE };

export const LOCATION_TYPE = {
  LOCATION: 'LOCATION',
  WAYPOINT: 'WAYPOINT',
  TRUCK: 'TRUCK',
};
export const LOCATION_WAYPOINT_TYPE = {
  HOME_YARD: 'HOME_YARD',
  LANDFILL_STORAGE_YARD: 'LANDFILL_STORAGE_YARD',
  LANDFILL: 'LANDFILL',
  RECYCLE_CENTER: 'RECYCLE_CENTER',
  STORAGE_YARD: 'STORAGE_YARD',
  TRANSFER_CENTER: 'TRANSFER_CENTER',
};

export const LOCATION = {
  ...LOCATION_TYPE,
  ...LOCATION_WAYPOINT_TYPE,
};

export const TRIP_TYPE = { PRE_TRIP: 'PRE_TRIP', POST_TRIP: 'POST_TRIP' };
export const TRIP = { ...TRIP_TYPE };

export const WORKORDER_MATERIAL = [
  'Asphalt',
  'Bulk',
  'C & D',
  'Concrete Recycle',
  'Dirt',
  'Metal Recycle',
  'MSW',
  'Roofing',
];

const constantsResponse = {
  workOrder: {
    action: {
      SPOT: 'SPOT',
      FINAL: 'FINAL',
      SWITCH: 'SWITCH',
      DUMP_AND_RETURN: 'DUMP & RETURN',
      LIVE_LOAD: 'LIVE LOAD',
      PICKUP: 'PICKUP CAN',
      DROPOFF: 'DROPOFF CAN',
      RELOCATE: 'RELOCATE',
      REPOSITION: 'REPOSITION',
      GENERAL_PURPOSE: 'GENERAL PURPOSE',
    },
    status: {
      UNASSIGNED: 'UNASSIGNED',
      ASSIGNED: 'ASSIGNED',
      INPROGRESS: 'INPROGRESS',
      COMPLETED: 'COMPLETED',
      CANCELED: 'CANCELED',
    },
    material: [
      'Asphalt',
      'Bulk',
      'C & D',
      'Concrete Recycle',
      'Dirt',
      'Metal Recycle',
      'MSW',
      'Roofing',
    ],
    note: {
      type: {
        MANIFEST: 'MANIFEST',
        NOTE: 'NOTE',
        SCALETICKET: 'SCALETICKET',
        WEIGHT_RECORD: 'WEIGHT_RECORD',
        TRANSITION: 'TRANSITION',
      },
      unittype: { YARDS: 'YARDS', TONS: 'TONS' },
      transitionState: {
        START_WORK_ORDER: 'START WORK ORDER',
        ARRIVE_ON_SITE: 'ARRIVE ON SITE',
        ARRIVE_ON_SITE2: 'ARRIVE ON SITE2',
        START_SERVICE: 'START SERVICE',
        START_SERVICE2: 'START SERVICE2',
        DROP_CAN: 'DROP CAN',
        PICKUP_CAN: 'PICKUP CAN',
        FINISH_SERVICE: 'FINISH SERVICE',
        FINISH_SERVICE2: 'FINISH SERVICE2',
        RECORD_WEIGHT: 'RECORD WEIGHT',
        RECORD_MANIFESTS: 'RECORD MANIFESTS',
        GOING_TO_FILL: 'GOING TO FILL',
        ARRIVE_AT_FILL: 'ARRIVE AT FILL',
        FINISH_DISPOSAL: 'FINISH DISPOSAL',
        RECORD_WEIGHT_TICKETS: 'RECORD WEIGHT TICKETS',
        RETURNING_TO_JOBSITE: 'RETURNING TO JOBSITE',
        REASSIGNMENT: 'REASSIGNMENT',
        WORK_ORDER_COMPLETE: 'WORK ORDER COMPLETE',
        SPECIAL_INSTRUCTIONS: 'SPECIAL INSTRUCTIONS',
      },
    },
  },
  import: { type: { APPEND: 'APPEND', UPDATE: 'UPDATE', DELETE: 'DELETE' } },
  timezone: {
    'America/Denver': 'America/Denver',
    'America/Detroit': 'America/Detroit',
    'America/Chicago': 'America/Chicago',
    'America/Phoenix': 'America/Phoenix',
    'America/Los_Angeles': 'America/Los_Angeles',
    'America/New_York': 'America/New_York',
  },
  actionTransitionsRelation: {
    SPOT: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'DROP CAN',
    ],
    'PICKUP CAN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'PICKUP CAN',
      'WORK ORDER COMPLETE',
    ],
    'DROPOFF CAN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'DROP CAN',
      'WORK ORDER COMPLETE',
    ],
    'GENERAL PURPOSE': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'SPECIAL INSTRUCTIONS',
      'WORK ORDER COMPLETE',
    ],
    FINAL: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'RECORD WEIGHT',
      'RECORD MANIFESTS',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
    ],
    'DUMP & RETURN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'RECORD WEIGHT',
      'RECORD MANIFESTS',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'RETURNING TO JOBSITE',
      'ARRIVE ON SITE2',
      'START SERVICE2',
      'DROP CAN',
      'FINISH SERVICE2',
    ],
    'LIVE LOAD': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'RECORD WEIGHT',
      'RECORD MANIFESTS',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'DROP CAN',
    ],
    RELOCATE: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'DROP CAN',
    ],
    REPOSITION: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'DROP CAN',
    ],
    SWITCH: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
      'PICKUP CAN',
      'RECORD WEIGHT',
      'RECORD MANIFESTS',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'DROP CAN',
    ],
  },
  actionTransitionsOrdered: {
    SPOT: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'DROP CAN',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
    ],
    FINAL: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'PICKUP CAN',
      'FINISH SERVICE',
      'RECORD WEIGHT',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'RECORD MANIFESTS',
      'WORK ORDER COMPLETE',
    ],
    SWITCH: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'DROP CAN',
      'PICKUP CAN',
      'FINISH SERVICE',
      'RECORD WEIGHT',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'RECORD MANIFESTS',
      'WORK ORDER COMPLETE',
    ],
    'LIVE LOAD': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'DROP CAN',
      'PICKUP CAN',
      'FINISH SERVICE',
      'RECORD WEIGHT',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'RECORD MANIFESTS',
      'WORK ORDER COMPLETE',
    ],
    'DUMP & RETURN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'PICKUP CAN',
      'FINISH SERVICE',
      'RECORD WEIGHT',
      'GOING TO FILL',
      'ARRIVE AT FILL',
      'FINISH DISPOSAL',
      'RECORD WEIGHT TICKETS',
      'RECORD MANIFESTS',
      'RETURNING TO JOBSITE',
      'ARRIVE ON SITE2',
      'START SERVICE2',
      'DROP CAN',
      'FINISH SERVICE2',
      'WORK ORDER COMPLETE',
    ],
    RELOCATE: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'PICKUP CAN',
      'DROP CAN',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
    ],
    REPOSITION: [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'START SERVICE',
      'PICKUP CAN',
      'DROP CAN',
      'FINISH SERVICE',
      'WORK ORDER COMPLETE',
    ],
    'DROPOFF CAN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'DROP CAN',
      'WORK ORDER COMPLETE',
    ],
    'GENERAL PURPOSE': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'SPECIAL INSTRUCTIONS',
      'WORK ORDER COMPLETE',
    ],
    'PICKUP CAN': [
      'START WORK ORDER',
      'ARRIVE ON SITE',
      'PICKUP CAN',
      'WORK ORDER COMPLETE',
    ],
  },
};
