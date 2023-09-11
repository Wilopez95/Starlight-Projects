import { DriverTruckRouteViolation, DriverTruckUniqueViolation } from '@root/consts';
import { IDailyRoute, IDashboardDailyRoute, IMasterRoute } from '@root/types';

type AnyDailyRoute = IDailyRoute | IDashboardDailyRoute | null;
type AnyRoute = AnyDailyRoute | IMasterRoute;

export const isRouteDriverInactive = (route: AnyRoute) =>
  route?.violation?.includes(DriverTruckRouteViolation.InactiveDriver);

export const isRouteTruckInactive = (route: AnyRoute) =>
  route?.violation?.includes(DriverTruckRouteViolation.InactiveTruck);

export const isDailyRouteDriverNonUnique = (route: AnyDailyRoute) =>
  route?.uniqueAssignmentViolation?.includes(DriverTruckUniqueViolation.RepeatedDriver);

export const isDailyRouteTruckNonUnique = (route: AnyDailyRoute) =>
  route?.uniqueAssignmentViolation?.includes(DriverTruckUniqueViolation.RepeatedTruck);
