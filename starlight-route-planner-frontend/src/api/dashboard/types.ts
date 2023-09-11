import { BusinessLineTypeSymbol, DailyRouteStatus } from '@root/consts';

export interface IDashboardParams {
  serviceDate: string;
  businessLineTypes?: BusinessLineTypeSymbol[];
  serviceAreaIds?: number[];
  statuses?: DailyRouteStatus[];
  truckTypes?: string[];
  searchInput?: string;
}

export interface IUpdateDashboardDailyRouteRequestParams {
  name: string;
  status: DailyRouteStatus;
  driverId: number;
  clockIn: string;
  clockOut: string;
  truckId: string;
  odometerStart: number;
  odometerEnd: number;
}
