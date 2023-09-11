export interface ICreateDailyRouteParams {
  name: string;
  serviceDate: string;
  color: string;
  workOrderIds: number[];
  truckId?: string;
  driverId?: number;
}

export interface IUpdateDailyRouteParams {
  id: number;
  name: string;
  workOrderIds: number[];
  truckId?: string;
  driverId?: number;
}
