import { range } from 'lodash-es';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation/types';

export const customerGroupNavigationConfig: RoutingNavigationItem[] = range(4).map(x => ({
  loading: true,
  content: x,
}));
