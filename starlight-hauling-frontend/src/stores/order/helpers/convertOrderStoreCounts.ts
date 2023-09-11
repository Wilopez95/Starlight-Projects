import { OrderStoreCountResponse } from '@root/types/counts';

import { OrderStoreCount } from '../types';

export function convertOrderStoreCounts(count: OrderStoreCountResponse): OrderStoreCount {
  return {
    total: count.total,
    filteredTotal: count.filteredTotal,
    ...count.statuses,
  };
}
