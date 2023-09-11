import { SubscriptionWorkOrderStatusEnum, SubscriptionWorkOrderStatusType } from '@root/types';

const labelByStatus: Record<SubscriptionWorkOrderStatusType, string> = {
  [SubscriptionWorkOrderStatusEnum.scheduled]: 'Scheduled',
  [SubscriptionWorkOrderStatusEnum.inProgress]: 'In Progress',
  [SubscriptionWorkOrderStatusEnum.completed]: 'Completed',
  [SubscriptionWorkOrderStatusEnum.canceled]: 'Canceled',
  [SubscriptionWorkOrderStatusEnum.blocked]: 'Blocked/Not Out',
};

export const getSubscriptionWorkOrderStatusLabel = (status: SubscriptionWorkOrderStatusType) =>
  labelByStatus[status];
