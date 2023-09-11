import { StoreCountResponse } from '@root/types';

import { OrderStoreCount } from '../types';

export function convertOrderStoreCounts(count: StoreCountResponse): OrderStoreCount {
  return {
    total: count.total,
  };
}
