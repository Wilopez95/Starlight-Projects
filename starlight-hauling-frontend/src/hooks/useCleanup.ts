import { useEffect } from 'react';

import { BaseEntity } from '@root/stores/base/BaseEntity';
import { type BaseStore } from '@root/stores/base/BaseStore';
import { SortType } from '@root/types';

export const useCleanup = <T extends string>(
  store: BaseStore<BaseEntity, T>,
  defaultSortBy?: Extract<T, T>,
  defaultSortOrder: SortType = 'asc',
) => {
  useEffect(() => {
    if (defaultSortBy) {
      store.setSort(defaultSortBy, defaultSortOrder, false);
    }

    return () => {
      store.cleanup();
      store.unSelectEntity();
    };
  }, [defaultSortBy, defaultSortOrder, store]);
};
