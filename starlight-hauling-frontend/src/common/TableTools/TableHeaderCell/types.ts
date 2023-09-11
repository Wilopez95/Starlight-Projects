import { BaseStore } from '@root/stores/base/BaseStore';
import { SortType } from '@root/types';
import { BaseEntity } from '../../../stores/base/BaseEntity';

import { ITableCell } from '../TableCell/types';

export type ITableHeaderCell = Omit<ITableCell, 'fallback' | 'tag' | 'to' | 'onClick'>;

interface ITableSortableHeadCell<Store extends BaseStore<BaseEntity, T>, T extends string>
  extends ITableHeaderCell {
  store: Store;
  sortKey: Extract<T, T>;
  onSort(): void | undefined;
}

//Special type for store with two sorting types (for example Payment and DeferredPayment)
interface ICustomStoreSortableHeadCell<T> extends ITableHeaderCell {
  sortKey: Extract<T, T>;
  currentSortBy: T;
  currentSortOrder: SortType;
  onStoreSortChange(sortBy: T, sortOrder: SortType): void;
  onSort(): void;
}

export type ITableSortableHeadCellComponent<T extends string> = React.PropsWithChildren<
  ICustomStoreSortableHeadCell<T> | ITableSortableHeadCell<BaseStore<BaseEntity, T>, T>
>;
