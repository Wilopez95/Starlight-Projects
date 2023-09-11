import { MutableRefObject } from 'react';

import { SortType } from '@root/core/types';

import { ITableCell } from '../TableCell/types';

export interface ITableSortableHeadCell<T = null> extends ITableCell {
  currentSortBy: T extends null ? string : T;
  sortKey: T extends null ? string : T;
  sortOrder: SortType;
  tableRef: MutableRefObject<HTMLDivElement | null>;
  title?: string;
  onSort(sortBy: T extends null ? string : T, sortOrder: SortType): void;
}
