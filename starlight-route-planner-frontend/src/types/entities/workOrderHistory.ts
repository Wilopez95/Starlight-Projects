import { IOrderHistoryGroup } from '@root/common/OrderHistory/components/HistoryGroup/types';
import { AvailableDailyRouteHistoryAttributes } from './dailyRouteHistory';

export enum AvailableWorkOrderHistoryAttributes {
  assignedRoute = 'assignedRoute',
  serviceDate = 'serviceDate',
  completedAt = 'completedAt',
  status = 'status',
  statusLonChange = 'statusLonChange',
  statusLatChange = 'statusLatChange',
  driverName = 'driverName',
  truckId = 'truckId',
  truckName = 'truckName',
  instructionsForDriver = 'instructionsForDriver',
  fileName = 'fileName',
  pickedUpEquipment = 'pickedUpEquipment',
  droppedEquipment = 'droppedEquipment',
  weight = 'weight',
  comment = 'comment',
  bestTimeToCome = 'bestTimeToCome',
  bestTimeToComeFrom = 'bestTimeToComeFrom',
  bestTimeToComeTo = 'bestTimeToComeTo',
  alleyPlacement = 'alleyPlacement',
  someoneOnSite = 'someoneOnSite',
  highPriority = 'highPriority',
  signatureRequired = 'signatureRequired',
  poRequired = 'poRequired',
  permitRequired = 'permitRequired',
  toRoll = 'toRoll',
  thirdPartyHaulerId = 'thirdPartyHaulerId',
  thirdPartyHaulerDescription = 'thirdPartyHaulerDescription',
}

export type IWorkOrderHistory = IOrderHistoryGroup<
  keyof typeof AvailableWorkOrderHistoryAttributes
>;

export type IDailyRouteOrderHistory = IOrderHistoryGroup<
  keyof typeof AvailableDailyRouteHistoryAttributes
>;
