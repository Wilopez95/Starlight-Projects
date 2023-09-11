import { TableSortableHeadCell } from './TableSortableHeadCell';
import { ITableSortableHeadCell } from './types';

export const createSortableComponent = <T>() => {
  return (TableSortableHeadCell as unknown) as React.FC<ITableSortableHeadCell<T>>;
};
