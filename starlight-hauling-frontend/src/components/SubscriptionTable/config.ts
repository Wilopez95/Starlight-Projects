import { Paths } from '@root/consts';
import { IRoute } from '@root/types';

import SubscriptionTable from './SubscriptionTable';

export const SubscriptionPageConfig: IRoute = {
  name: 'subscriptions',
  path: Paths.SubscriptionModule.Subscriptions,
  component: SubscriptionTable,
};

export const MySubscriptionsPageConfig: IRoute = {
  name: 'my subscriptions',
  path: Paths.SubscriptionModule.MySubscriptions,
  component: SubscriptionTable,
};
