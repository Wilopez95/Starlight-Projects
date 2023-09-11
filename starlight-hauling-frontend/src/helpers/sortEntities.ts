import { orderBy } from 'lodash-es';

import { ConfigurationSortType, SortTypesData } from '@root/stores/base/types';
import { IEntity } from '@root/types';

import { baseSort } from './baseSort';

export const sortEntities = <T extends IEntity>(
  data: T[],
  sortOrder: ConfigurationSortType<T>,
  showInactive = true,
) => {
  const { sortKeys, sortOrders } = sortOrder.reduce<SortTypesData<T>>(
    (acc, cur) => {
      if (typeof cur === 'object') {
        acc.sortKeys.push((entity: T) => baseSort(entity[cur.key]));
        acc.sortOrders.push(cur.order);
      } else {
        acc.sortKeys.push((entity: T) => baseSort(entity[cur]));
        acc.sortOrders.push('asc');
      }

      return acc;
    },
    {
      sortKeys: [],
      sortOrders: [],
    },
  );

  if (showInactive) {
    return orderBy(data, ['active', ...sortKeys], ['desc', ...sortOrders]);
  }

  return orderBy(data, sortKeys, sortOrders);
};
