import { DailyRouteStatus, MasterRouteStatus, WorkOrderStatus } from '@root/consts';

export type RouteType = 'master-routes' | 'daily-routes' | 'dashboard' | 'work-orders';

export interface IStatusBadge {
  status:
    | keyof typeof MasterRouteStatus
    | keyof typeof DailyRouteStatus
    | keyof typeof WorkOrderStatus;
  routeType: RouteType;
}
