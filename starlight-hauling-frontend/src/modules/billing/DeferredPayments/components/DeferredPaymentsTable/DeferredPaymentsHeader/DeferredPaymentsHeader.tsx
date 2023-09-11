import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { TableCheckboxCell, TableTools } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

import { IDeferredPaymentsTableHeader } from './types';

const DeferredPaymentsTableHeader: React.FC<IDeferredPaymentsTableHeader> = ({ onSort }) => {
  const { paymentStore } = useStores();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      paymentStore.checkAllDeferred(e.target.checked);
    },
    [paymentStore],
  );

  const isAllChecked = paymentStore.isAllDeferredChecked;
  const checkedPayments = paymentStore.checkedPayments;
  const indeterminate = !isAllChecked && checkedPayments.length > 0;

  return (
    <TableTools.Header>
      <TableCheckboxCell
        header
        name="AllDeferredPayments"
        onChange={handleCheckAll}
        value={isAllChecked}
        indeterminate={indeterminate}
      />
      <TableTools.SortableHeaderCell
        sortKey="CUSTOMER"
        onSort={onSort}
        onStoreSortChange={paymentStore.setDeferredSort}
        currentSortOrder={paymentStore.sortOrder}
        currentSortBy={paymentStore.deferredSortBy}
      >
        Customer
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>Order#</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="DATE"
        onSort={onSort}
        onStoreSortChange={paymentStore.setDeferredSort}
        currentSortOrder={paymentStore.sortOrder}
        currentSortBy={paymentStore.deferredSortBy}
      >
        Service Date
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="DEFERRED_UNTIL"
        onSort={onSort}
        onStoreSortChange={paymentStore.setDeferredSort}
        currentSortOrder={paymentStore.sortOrder}
        currentSortBy={paymentStore.deferredSortBy}
      >
        Pay Date
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>Payment Method</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="STATUS"
        onSort={onSort}
        onStoreSortChange={paymentStore.setDeferredSort}
        currentSortOrder={paymentStore.sortOrder}
        currentSortBy={paymentStore.deferredSortBy}
      >
        Payment Status
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="AMOUNT"
        onSort={onSort}
        onStoreSortChange={paymentStore.setDeferredSort}
        currentSortOrder={paymentStore.sortOrder}
        currentSortBy={paymentStore.deferredSortBy}
        right
      >
        Amount, $
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export default observer(DeferredPaymentsTableHeader);
