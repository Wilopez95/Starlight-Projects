import { IOrderHistoryGroup } from '@root/common/OrderHistory/components/HistoryGroup/types';

export enum AvailableDailyRouteHistoryAttributes {
  name = 'name',
  status = 'status',
  serviceDate = 'serviceDate',
  truckId = 'truckId',
  driverId = 'driverId',
  driverName = 'driverName',
  truckType = 'truckType',
  truckName = 'truckName',
  completedAt = 'completedAt',
  clockIn = 'clockIn',
  clockOut = 'clockOut',
  odometerStart = 'odometerStart',
  odometerEnd = 'odometerEnd',
  workOrderIds = 'workOrderIds',
  ticketNumber = 'ticketNumber',
}

export type IDailyRouteHistory = IOrderHistoryGroup<
  keyof typeof AvailableDailyRouteHistoryAttributes
>;
