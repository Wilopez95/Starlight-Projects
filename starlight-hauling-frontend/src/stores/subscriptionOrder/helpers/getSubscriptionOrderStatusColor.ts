import { Colors } from '@starlightpro/shared-components';

import { SubscriptionOrderStatusEnum } from '@root/types';

const colorByStatus: Record<SubscriptionOrderStatusEnum, Colors> = {
  [SubscriptionOrderStatusEnum.scheduled]: 'primary',
  [SubscriptionOrderStatusEnum.inProgress]: 'success',
  [SubscriptionOrderStatusEnum.completed]: 'information',
  [SubscriptionOrderStatusEnum.needsApproval]: 'secondary',
  [SubscriptionOrderStatusEnum.blocked]: 'alert',
  [SubscriptionOrderStatusEnum.skipped]: 'primary',
  [SubscriptionOrderStatusEnum.canceled]: 'alert',
  [SubscriptionOrderStatusEnum.approved]: 'alternative',
  [SubscriptionOrderStatusEnum.finalized]: 'information',
  [SubscriptionOrderStatusEnum.invoiced]: 'success',
};

export const getSubscriptionOrderStatusColor = (status: SubscriptionOrderStatusEnum) =>
  colorByStatus[status];
