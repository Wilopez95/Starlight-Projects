import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { TableCheckboxCell, TableTools } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

import { IFinanceChargeTableHeader } from './types';

const FinanceChargeTableHeader: React.FC<IFinanceChargeTableHeader> = ({
  showCustomer,
  onSortChange,
}) => {
  const { financeChargeStore } = useStores();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      financeChargeStore.checkAll(e.target.checked);
    },
    [financeChargeStore],
  );

  const isAllChecked = financeChargeStore.isAllChecked;
  const checkedFinanceCharges = financeChargeStore.checkedFinanceCharges;
  const indeterminate = !isAllChecked && checkedFinanceCharges.length > 0;

  return (
    <TableTools.Header>
      <TableCheckboxCell
        header
        name="AllFinanceCharges"
        onChange={handleCheckAll}
        value={isAllChecked}
        indeterminate={indeterminate}
      />
      <TableTools.SortableHeaderCell
        store={financeChargeStore}
        sortKey="CREATED_AT"
        onSort={onSortChange}
      >
        Created At
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={financeChargeStore} sortKey="ID" onSort={onSortChange}>
        Fin Charge #
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={financeChargeStore}
        sortKey="STATUS"
        onSort={onSortChange}
      >
        Status
      </TableTools.SortableHeaderCell>
      {showCustomer ? (
        <>
          <TableTools.SortableHeaderCell
            store={financeChargeStore}
            sortKey="CUSTOMER"
            onSort={onSortChange}
          >
            Customer
          </TableTools.SortableHeaderCell>
          <TableTools.SortableHeaderCell
            store={financeChargeStore}
            sortKey="CUSTOMER_TYPE"
            onSort={onSortChange}
          >
            Customer Type
          </TableTools.SortableHeaderCell>
        </>
      ) : null}
      <TableTools.HeaderCell>Preview</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell
        store={financeChargeStore}
        sortKey="TOTAL"
        onSort={onSortChange}
        right
      >
        Total, $
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={financeChargeStore}
        sortKey="REMAINING_BALANCE"
        onSort={onSortChange}
        right
      >
        Remaining Balance, $
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export default observer(FinanceChargeTableHeader);
