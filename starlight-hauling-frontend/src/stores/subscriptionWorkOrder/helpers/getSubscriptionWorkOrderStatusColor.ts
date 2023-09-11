import { Colors } from '@starlightpro/shared-components';

import { SubscriptionWorkOrderStatusEnum, SubscriptionWorkOrderStatusType } from '@root/types';

const colorByStatus: Record<SubscriptionWorkOrderStatusType, Colors> = {
  [SubscriptionWorkOrderStatusEnum.scheduled]: 'primary',
  [SubscriptionWorkOrderStatusEnum.inProgress]: 'success',
  [SubscriptionWorkOrderStatusEnum.completed]: 'information',
  [SubscriptionWorkOrderStatusEnum.canceled]: 'alert',
  [SubscriptionWorkOrderStatusEnum.blocked]: 'purple',
};

export const getSubscriptionWorkOrderStatusColor = (status: SubscriptionWorkOrderStatusType) =>
  colorByStatus[status];
