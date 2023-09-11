import { IEntity } from '@root/types';

export type ConfigurationSortType<T extends IEntity> = (
  | keyof T
  | {
      key: keyof T;
      order: 'asc' | 'desc';
    }
)[];

export type SortTypesData<T extends IEntity> = {
  sortKeys: (((entity: T) => T[keyof T]) | keyof T)[];
  sortOrders: ('asc' | 'desc')[];
};
