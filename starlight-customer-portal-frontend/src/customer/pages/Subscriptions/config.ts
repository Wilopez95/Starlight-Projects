import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import Subscriptions from './Subscriptions';

export const SubscriptionPageConfig: IRoute = {
  name: 'subscriptions',
  entity: 'subscriptions',
  path: Paths.Subscriptions,
  Component: Subscriptions,
};
