export enum RouteType {
  MasterRoute = 'MasterRoute',
  DailyRoute = 'DailyRoute',
}

export const SYSTEM_EDITING = 'system';

export enum DriverTruckRouteViolation {
  InactiveTruck = 'INACTIVE_TRUCK',
  InactiveDriver = 'INACTIVE_DRIVER',
}

export enum DriverTruckUniqueViolation {
  RepeatedTruck = 'REPEATED_TRUCK',
  RepeatedDriver = 'REPEATED_DRIVER',
}
