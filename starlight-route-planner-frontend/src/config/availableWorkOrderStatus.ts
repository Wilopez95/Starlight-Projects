import { WorkOrderStatus } from '@root/consts/workOrder';

export const availableWorkOrdersStatuses = [
  WorkOrderStatus.SCHEDULED,
  WorkOrderStatus.IN_PROGRESS,
  WorkOrderStatus.COMPLETED,
  WorkOrderStatus.CANCELED,
  WorkOrderStatus.BLOCKED,
];
