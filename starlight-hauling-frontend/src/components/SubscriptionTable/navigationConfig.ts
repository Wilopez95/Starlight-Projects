import { SubscriptionTabRoutes } from '@root/consts';
import { SubscriptionStatusEnum } from '@root/types';

export const baseRoutingConfig: {
  label: string;
  value: SubscriptionTabRoutes;
  status?: SubscriptionStatusEnum;
}[] = [
  { label: 'Draft', value: SubscriptionTabRoutes.Draft },
  { label: 'Active', value: SubscriptionTabRoutes.Active, status: SubscriptionStatusEnum.Active },
  { label: 'On Hold', value: SubscriptionTabRoutes.OnHold, status: SubscriptionStatusEnum.OnHold },
  { label: 'Closed', value: SubscriptionTabRoutes.Closed, status: SubscriptionStatusEnum.Closed },
];
