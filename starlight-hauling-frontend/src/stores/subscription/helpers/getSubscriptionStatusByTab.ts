import { SubscriptionTabRoutes } from '@root/consts';
import { SubscriptionStatusEnum } from '@root/types';

import { SubscriptionStoreTabRoutes } from '../types';

const statusByType: Record<SubscriptionStoreTabRoutes, SubscriptionStatusEnum> = {
  [SubscriptionTabRoutes.Active]: SubscriptionStatusEnum.Active,
  [SubscriptionTabRoutes.OnHold]: SubscriptionStatusEnum.OnHold,
  [SubscriptionTabRoutes.Closed]: SubscriptionStatusEnum.Closed,
};

export const getSubscriptionStatusByTab = (tab: SubscriptionStoreTabRoutes) => statusByType[tab];
