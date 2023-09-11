import { SubscriptionTabRoutes } from '@root/core/consts';
import { SubscriptionStatusEnum } from '@root/core/types';

import { SubscriptionStoreTabRoutes } from '../types';

const statusByType: Record<SubscriptionStoreTabRoutes, SubscriptionStatusEnum> = {
  [SubscriptionTabRoutes.Active]: SubscriptionStatusEnum.Active,
  [SubscriptionTabRoutes.OnHold]: SubscriptionStatusEnum.OnHold,
  [SubscriptionTabRoutes.Closed]: SubscriptionStatusEnum.Closed,
};

export const getSubscriptionStatusByTab = (tab: SubscriptionStoreTabRoutes) => statusByType[tab];
