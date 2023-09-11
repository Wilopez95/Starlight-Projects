import {
  BusinessLineTypeSymbol,
  DailyRouteStatus,
  DriverTruckRouteViolation,
  DriverTruckUniqueViolation,
} from '@root/consts';

import { SpeedMeasure } from '../enums/measureUnits';

import { IMasterRoute, IWeightTicket, IWorkOrder } from '.';
import { IEntity } from './entity';

// for sorting
export const enum DashboardDailyRouteKeys {
  id = 'id',
  updatedAt = 'updatedAt',
  createdAt = 'createdAt',
  businessLineType = 'businessLineType',
  name = 'name',
  status = 'status',
  numberOfStops = 'numberOfStops',
  completedAt = 'completedAt',
  numberOfWos = 'numberOfWos',
  driverName = 'driverName',
  truckId = 'truckId',
  truckType = 'truckType',
  ticket = 'ticket',
  completionRate = 'completionRate',
}

export interface IDashboardDailyRoute extends IEntity {
  [DashboardDailyRouteKeys.status]: DailyRouteStatus;
  [DashboardDailyRouteKeys.name]: string | null;
  [DashboardDailyRouteKeys.numberOfStops]: number | null;
  [DashboardDailyRouteKeys.numberOfWos]: number | null;
  [DashboardDailyRouteKeys.driverName]: string | null;
  [DashboardDailyRouteKeys.truckId]: string | null;
  [DashboardDailyRouteKeys.truckType]: string | null;
  [DashboardDailyRouteKeys.completionRate]: number;
  [DashboardDailyRouteKeys.completedAt]: number | null;
  [DashboardDailyRouteKeys.businessLineType]?: BusinessLineTypeSymbol;
  businessUnitId: number;
  color: string;
  isEdited: boolean;
  driverId: number;
  serviceDate: string;
  workOrders: IWorkOrder[];
  ticket?: string;
  editingBy?: string;
  clockIn?: string;
  clockOut?: string;
  odometerStart?: number;
  odometerEnd?: number;
  unitOfMeasure?: SpeedMeasure;
  parentRoute?: IMasterRoute;
  parentRouteId?: number;
  violation?: DriverTruckRouteViolation[];
  uniqueAssignmentViolation?: DriverTruckUniqueViolation[];
  weightTickets?: IWeightTicket[];
}
