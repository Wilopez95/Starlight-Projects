import {
  BusinessLineTypeSymbol,
  DailyRouteStatus,
  DriverTruckRouteViolation,
  DriverTruckUniqueViolation,
} from '@root/consts';
import { convertDates } from '@root/helpers';
import { IDailyRoute, IMasterRoute, IWorkOrder, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { DailyRoutesStore } from './DailyRoutesStore';

export class DailyRouteItem extends BaseEntity implements IDailyRoute {
  businessUnitId: number;
  color: string;
  driverId: number;
  name: string;
  status: DailyRouteStatus;
  serviceDate: string;
  truckId: string;
  workOrders: IWorkOrder[];
  isEdited: boolean;
  parentRouteId: number;
  parentRoute: IMasterRoute;
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
  checked?: boolean;

  store: DailyRoutesStore;

  constructor(store: DailyRoutesStore, entity: JsonConversions<IDailyRoute>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.name = entity.name;
    this.businessUnitId = entity.businessUnitId;
    this.color = entity.color;
    this.driverId = entity.driverId;
    this.workOrders = entity.workOrders.map(convertDates);
    this.serviceDate = entity.serviceDate;
    this.truckId = entity.truckId;
    this.status = entity.status;
    this.isEdited = entity.isEdited;
    this.parentRouteId = entity.parentRouteId;
    this.parentRoute = convertDates(entity.parentRoute);
    this.businessLineType = entity.businessLineType;
    this.completionRate = entity.completionRate;
    this.driverName = entity.driverName;
    this.completedAt = entity.completedAt;
    this.clockIn = entity.clockIn;
    this.clockOut = entity.clockOut;
    this.odometerStart = entity.odometerStart;
    this.odometerEnd = entity.odometerEnd;
    this.editingBy = entity.editingBy;
    this.violation = entity.violation;
    this.uniqueAssignmentViolation = entity.uniqueAssignmentViolation;
    this.checked = entity.checked;
    //TODO: added here because parse function in Base class cannot be used as timestamp is sent from backend as string
    this.createdAt = new Date(+entity.createdAt);
    this.updatedAt = new Date(+entity.updatedAt);
  }
}
