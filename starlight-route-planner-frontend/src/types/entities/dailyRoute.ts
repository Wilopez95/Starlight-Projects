import {
  BusinessLineTypeSymbol,
  DailyRouteStatus,
  DriverTruckRouteViolation,
  DriverTruckUniqueViolation,
} from '@root/consts';

import { IWorkOrder } from '.';
import { IEntity } from './entity';
import { IMasterRoute } from './masterRoute';

export interface IDailyRouteNamesListParams {
  serviceDate: Date | string;
  businessLineTypes: BusinessLineTypeSymbol[];
}

export interface IDailyRoutesListParams {
  serviceDate?: Date | string;
  limit?: number;
  skip?: number;
}

export interface IDailyRoute extends IEntity {
  status: DailyRouteStatus;
  name: string;
  serviceDate: string;
  businessUnitId: number;
  color: string;
  workOrders: IWorkOrder[];
  isEdited: boolean;
  parentRouteId: number;
  parentRoute: IMasterRoute;
  driverId: number;
  truckId: string;
  completionRate: number;
  driverName: string;
  completedAt: number | null;
  clockIn: string;
  clockOut: string;
  businessLineType?: BusinessLineTypeSymbol;
  odometerStart?: number;
  odometerEnd?: number;
  editingBy?: string | null;
  violation?: DriverTruckRouteViolation[];
  uniqueAssignmentViolation?: DriverTruckUniqueViolation[];
  // For local settings
  checked?: boolean;
}

export interface IDailyRouteEditModeNotice {
  message: string;
  currentlyEditingBy: string;
  editorId: string;
  id?: number;
  name?: string;
}
