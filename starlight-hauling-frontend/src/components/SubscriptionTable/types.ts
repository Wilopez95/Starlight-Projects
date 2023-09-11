import { SubscriptionTabRoutes } from '@root/consts';

export interface ISubscriptionTable {
  mine?: boolean;
}

export type SubscriptionsRouteParams = {
  subPath: SubscriptionTabRoutes;
  my?: string;
  subscriptionId?: string;
};
