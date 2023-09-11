import { Colors } from '@starlightpro/shared-components';

import { WorkOrderStatus } from '@root/consts';
import { OrderStatusType } from '@root/types';

const colorByStatus: Record<OrderStatusType, Colors> = {
  finalized: 'information',
  approved: 'alternative',
  completed: 'primary',
  invoiced: 'success',
  inProgress: 'success',
  canceled: 'alert',
};

const colorByWorkOrderStatus: Record<WorkOrderStatus, Colors> = {
  [WorkOrderStatus.Scheduled]: 'primary',
  [WorkOrderStatus.InProgress]: 'success',
  [WorkOrderStatus.Completed]: 'information',
  [WorkOrderStatus.Canceled]: 'alert',
  [WorkOrderStatus.Assigned]: 'information',
  [WorkOrderStatus.Unassigned]: 'information',
  [WorkOrderStatus.Blocked]: 'alert',
};

export const getColorByStatus = (status: OrderStatusType) => colorByStatus[status];

export const getColorByWorkOrderStatus = (status: WorkOrderStatus) =>
  colorByWorkOrderStatus[status];
