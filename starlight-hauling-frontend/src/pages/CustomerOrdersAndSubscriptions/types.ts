import { SubscriptionTabRoutes } from '@root/consts';

export type CustomerOrdersAndSubscriptionsParams = {
  customerId: string;
  tab: SubscriptionTabRoutes;
};

export interface ICustomerOrdersAndSubscriptionLayoutNavigation {
  title: string;
  subtitle: string;
  path: string;
}
