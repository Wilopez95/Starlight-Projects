import {
  BusinessLineTypeSymbol,
  DailyRouteStatus,
  DriverTruckRouteViolation,
  DriverTruckUniqueViolation,
} from '@root/consts';
import { convertDates, convertTimeStamps } from '@root/helpers';
import { IMasterRoute, IWeightTicket, IWorkOrder, JsonConversions } from '@root/types';
import { IDashboardDailyRoute } from '@root/types/entities/dashboard';
import { SpeedMeasure } from '@root/types/enums';

import { BaseEntity } from '../base/BaseEntity';

import { DashboardStore } from './DashboardStore';

export class DashboardDailyRoute extends BaseEntity implements IDashboardDailyRoute {
  store: DashboardStore;
  status: DailyRouteStatus;
  name: string | null;
  numberOfStops: number | null;
  numberOfWos: number | null;
  driverName: string | null;
  completionRate: number;
  businessUnitId: number;
  color: string;
  isEdited: boolean;
  driverId: number;
  truckId: string | null;
  truckType: string | null;
  completedAt: number | null;
  serviceDate: string;
  workOrders: IWorkOrder[];
  ticket?: string;
  parentRoute?: IMasterRoute;
  editingBy?: string;
  clockIn?: string;
  clockOut?: string;
  odometerStart?: number;
  odometerEnd?: number;
  unitOfMeasure?: SpeedMeasure;
  parentRouteId?: number;
  businessLineType?: BusinessLineTypeSymbol;
  violation?: DriverTruckRouteViolation[];
  uniqueAssignmentViolation?: DriverTruckUniqueViolation[];
  weightTickets?: IWeightTicket[];

  constructor(store: DashboardStore, entity: JsonConversions<IDashboardDailyRoute>) {
    super(entity);
    this.store = store;
    this.status = entity.status;
    this.name = entity.name;
    this.numberOfStops = entity.numberOfStops;
    this.completedAt = entity.completedAt;
    this.serviceDate = entity.serviceDate;
    this.numberOfWos = entity.numberOfWos;
    this.driverName = entity.driverName;
    this.truckId = entity.truckId;
    this.truckType = entity.truckType;
    this.ticket = entity.ticket;
    this.completionRate = entity.completionRate;
    this.businessLineType = entity.businessLineType;
    this.businessUnitId = entity.businessUnitId;
    this.color = entity.color;
    this.workOrders = entity.workOrders.map(convertDates);
    this.isEdited = entity.isEdited;
    this.driverId = entity.driverId;
    this.parentRouteId = entity.parentRouteId;
    this.parentRoute = convertDates(entity.parentRoute);
    this.editingBy = entity.editingBy;
    this.clockIn = entity.clockIn;
    this.clockOut = entity.clockOut;
    this.odometerStart = entity.odometerStart;
    this.odometerEnd = entity.odometerEnd;
    this.unitOfMeasure = entity.unitOfMeasure;
    this.violation = entity.violation;
    this.uniqueAssignmentViolation = entity.uniqueAssignmentViolation;
    this.weightTickets = entity.weightTickets?.map(convertTimeStamps);
  }
}
