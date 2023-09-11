import { IStoreCount } from '@root/types';

export function convertSubscriptionStoreCounts(count: IStoreCount): IStoreCount {
  return {
    total: count.total,
    filteredTotal: count.filteredTotal,
  };
}
