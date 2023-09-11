import { Colors } from '@root/core/theme/baseTypes';
import { SubscriptionStatusEnum } from '@root/core/types';

const colorByStatus: Record<SubscriptionStatusEnum, Colors> = {
  [SubscriptionStatusEnum.Active]: 'success',
  [SubscriptionStatusEnum.OnHold]: 'primary',
  [SubscriptionStatusEnum.Closed]: 'alert',
};

export const getSubscriptionColorByStatus = (status?: SubscriptionStatusEnum) => {
  //secondary for draft
  return status ? colorByStatus[status] : 'secondary';
};
