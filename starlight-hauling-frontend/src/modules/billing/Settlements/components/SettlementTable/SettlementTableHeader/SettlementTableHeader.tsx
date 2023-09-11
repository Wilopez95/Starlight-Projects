import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { TableCheckboxCell, TableTools } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';
import { ISettlementTableHeader } from '../types';

const SettlementTableHeader: React.FC<ISettlementTableHeader> = ({ onSort }) => {
  const { settlementStore } = useStores();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      settlementStore.checkAll(e.target.checked);
    },
    [settlementStore],
  );

  const isAllChecked = settlementStore.isAllChecked;
  const checkedSettlements = settlementStore.checkedSettlements;
  const indeterminate = !isAllChecked && checkedSettlements.length > 0;

  return (
    <TableTools.Header>
      <TableCheckboxCell
        header
        name="AllSettlements"
        onChange={handleCheckAll}
        value={isAllChecked}
        indeterminate={indeterminate}
      />
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="DATE" onSort={onSort}>
        Date
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="PROCESSOR" onSort={onSort}>
        Processor
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="MERCHANT_ID" onSort={onSort}>
        Merchant ID
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="COUNT" onSort={onSort}>
        Count
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="AMOUNT" onSort={onSort} right>
        Amount, $
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="FEES" onSort={onSort} right>
        Fees, $
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={settlementStore}
        sortKey="ADJUSTMENT"
        onSort={onSort}
        right
      >
        Adjustments, $
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell store={settlementStore} sortKey="NET" onSort={onSort} right>
        Net, $
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export default observer(SettlementTableHeader);
