import { DailyRouteStatus, MasterRouteStatus, WorkOrderStatus } from '@root/consts';
import { ColorType, statusColor } from '@root/consts/status';

import { RouteType } from './types';

export const DailyRouteStatusColor: {
  [key in DailyRouteStatus]: ColorType;
} = {
  IN_PROGRESS: 'green',
  SCHEDULED: 'blue',
  CANCELED: 'red',
  COMPLETED: 'orange',
  // verify color (updating is only for UI)
  UPDATING: 'green',
};

export const WorkOrderStatusColor: {
  [key in WorkOrderStatus]: ColorType;
} = {
  SCHEDULED: 'blue',
  IN_PROGRESS: 'green',
  BLOCKED: 'red',
  CANCELED: 'red',
  COMPLETED: 'orange',
  // TODO verify colors
  APPROVED: 'green',
  FINALIZED: 'green',
  INVOICED: 'green',
};

export const MasterRouteStatusColor: {
  [key in MasterRouteStatus]: ColorType;
} = {
  ACTIVE: 'orange',
  EDITING: 'grey',
  // only for ui
  UPDATING: 'green',
  PUBLISHED: 'orange',
  UNPUBLISHED: 'grey',
};

export const getStatusBadgeProps = (
  status:
    | keyof typeof MasterRouteStatus
    | keyof typeof DailyRouteStatus
    | keyof typeof WorkOrderStatus,
  routeType: RouteType,
) => {
  let routeColor: ColorType;

  switch (routeType) {
    case 'master-routes': {
      routeColor = MasterRouteStatusColor[status as MasterRouteStatus];
      break;
    }
    case 'daily-routes':
    case 'dashboard': {
      routeColor = DailyRouteStatusColor[status as DailyRouteStatus];
      break;
    }
    case 'work-orders': {
      routeColor = WorkOrderStatusColor[status as WorkOrderStatus];
      break;
    }
    default: {
      routeColor = DailyRouteStatusColor[status as DailyRouteStatus];
      break;
    }
  }

  return statusColor[routeColor];
};
