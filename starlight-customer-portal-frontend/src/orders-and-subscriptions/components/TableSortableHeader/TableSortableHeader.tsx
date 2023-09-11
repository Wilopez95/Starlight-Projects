import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { TableHeader } from '@root/core/common/TableTools/TableHeader';
import { createSortableComponent } from '@root/core/common/TableTools/TableSortableHeadCell/helpers';
import { SortType } from '@root/core/types';

import { useSubscriptionCells } from '../../hooks/subscriptionCells';

import { CellParams, ITableSortableHeader, SortKey } from './types';

const TableSortableHeadCell = createSortableComponent<SortKey>();

const TableSortableHeader: React.FC<ITableSortableHeader> = ({
  tableRef,
  requestOptions,
  relatedStore,
  sortableTableTitle,
}) => {
  const handleSortChange = useCallback(
    (sortBy: SortKey, sortOrder: SortType) => {
      relatedStore.setSort(sortBy, sortOrder);
      if (!relatedStore.search) {
        relatedStore.cleanup();
        relatedStore.request(requestOptions);
      }
    },
    [relatedStore, requestOptions],
  );

  const allCells = useSubscriptionCells();

  return (
    <TableHeader>
      {allCells[sortableTableTitle].map((cell: CellParams) => {
        return (
          <TableSortableHeadCell
            key={cell.sortKey}
            sortKey={cell.sortKey}
            tableRef={tableRef}
            onSort={handleSortChange}
            currentSortBy={relatedStore.sortBy}
            sortOrder={relatedStore.sortOrder}
          >
            {cell.title}
          </TableSortableHeadCell>
        );
      })}
    </TableHeader>
  );
};

export default observer(TableSortableHeader);
