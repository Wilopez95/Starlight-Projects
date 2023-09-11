import { IWorkOrder } from '@root/types';

export type IWorkOrderMapItem = Pick<
  IWorkOrder,
  | 'id'
  | 'isIndependent'
  | 'status'
  | 'workOrderId'
  | 'orderId'
  | 'serviceDate'
  | 'customerId'
  | 'jobSiteId'
  | 'materialId'
  | 'equipmentItemId'
  | 'businessLineId'
  | 'jobSite'
  | 'billableServiceId'
  | 'billableServiceDescription'
  | 'dailyRouteId'
  | 'subscriptionId'
  | 'assignedRoute'
  | 'bestTimeToComeFrom'
  | 'bestTimeToComeTo'
  | 'sequence'
  | 'displayId'
  | 'orderDisplayId'
  | 'createdAt'
  | 'updatedAt'
>;
