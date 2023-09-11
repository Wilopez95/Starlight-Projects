import { SubscriptionOrderStatusEnum } from '@root/types';

const labelByStatus: Record<SubscriptionOrderStatusEnum, string> = {
  [SubscriptionOrderStatusEnum.scheduled]: 'Scheduled',
  [SubscriptionOrderStatusEnum.inProgress]: 'InProgress',
  [SubscriptionOrderStatusEnum.completed]: 'Completed',
  [SubscriptionOrderStatusEnum.needsApproval]: 'NeedsApproval',
  [SubscriptionOrderStatusEnum.blocked]: 'Blocked',
  [SubscriptionOrderStatusEnum.skipped]: 'Skipped',
  [SubscriptionOrderStatusEnum.canceled]: 'Canceled',
  [SubscriptionOrderStatusEnum.approved]: 'Approved',
  [SubscriptionOrderStatusEnum.finalized]: 'Finalized',
  [SubscriptionOrderStatusEnum.invoiced]: 'Invoiced',
};

export const getSubscriptionOrderStatusLabel = (status: SubscriptionOrderStatusEnum) =>
  labelByStatus[status];
