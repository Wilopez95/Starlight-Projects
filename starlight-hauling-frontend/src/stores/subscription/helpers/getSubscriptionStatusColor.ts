import { Colors } from '@starlightpro/shared-components';

import { SubscriptionStatusEnum } from '@root/types';

const colorByStatus: Record<SubscriptionStatusEnum, Colors> = {
  [SubscriptionStatusEnum.Active]: 'success',
  [SubscriptionStatusEnum.OnHold]: 'primary',
  [SubscriptionStatusEnum.Closed]: 'alert',
};

export const getSubscriptionColorByStatus = (status?: SubscriptionStatusEnum) => {
  //secondary for draft
  return status ? colorByStatus[status] : 'secondary';
};
