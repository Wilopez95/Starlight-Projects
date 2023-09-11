import { SubscriptionStoreCountResponse } from '@root/types/counts';

import { SubscriptionStoreCount } from '../types';

export function convertSubscriptionStoreCounts(
  count: SubscriptionStoreCountResponse,
): SubscriptionStoreCount {
  return {
    total: count.total,
    filteredTotal: count.filteredTotal,
    ...count.statuses,
  };
}
