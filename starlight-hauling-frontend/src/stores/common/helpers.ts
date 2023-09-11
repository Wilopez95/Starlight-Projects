import { IStoreCount, StoreCountResponse } from '@root/types/counts';

export function mapCounts<T extends StoreCountResponse>(
  counts: T,
): Omit<T, keyof StoreCountResponse> & IStoreCount {
  return {
    ...counts,
    filteredTotal: counts.filteredTotal ?? counts.total,
  };
}
