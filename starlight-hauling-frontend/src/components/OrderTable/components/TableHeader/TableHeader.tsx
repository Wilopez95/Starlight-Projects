import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { TableCheckboxCell, TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { IOrderTableHeader } from './types';

const OrderTableHeader: React.FC<IOrderTableHeader> = ({ requestOptions, selectable }) => {
  const { orderStore } = useStores();

  const handleSortChange = useCallback(() => {
    orderStore.request(requestOptions);
  }, [orderStore, requestOptions]);

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      orderStore.checkAll(e.target.checked);
    },
    [orderStore],
  );

  const isAllChecked = orderStore.isAllChecked;
  const checkedOrders = orderStore.checkedOrders;
  const indeterminate = !isAllChecked && checkedOrders.length > 0;

  return (
    <TableTools.Header>
      {selectable ? (
        <TableCheckboxCell
          header
          name="checkAllOrders"
          onChange={handleCheckAll}
          value={isAllChecked}
          indeterminate={indeterminate}
        />
      ) : null}
      <TableTools.SortableHeaderCell
        store={orderStore}
        sortKey="serviceDate"
        onSort={handleSortChange}
      >
        Service Date
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell store={orderStore} sortKey="id" onSort={handleSortChange}>
        Order#
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        store={orderStore}
        sortKey="lineOfBusiness"
        onSort={handleSortChange}
      >
        Line of Business
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        store={orderStore}
        sortKey="woNumber"
        onSort={handleSortChange}
      >
        WO#
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>Status</TableTools.HeaderCell>
      <TableTools.HeaderCell>Media</TableTools.HeaderCell>

      <TableTools.SortableHeaderCell store={orderStore} sortKey="jobSite" onSort={handleSortChange}>
        Job site
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell store={orderStore} sortKey="service" onSort={handleSortChange}>
        Service
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        store={orderStore}
        sortKey="customerName"
        onSort={handleSortChange}
      >
        Customer
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={orderStore}
        sortKey="total"
        onSort={handleSortChange}
        right
      >
        Total, $
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export const TableHeader = observer(OrderTableHeader);
