import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { TableCheckboxCell, TableTools } from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';
import { IBatchStatementsTableHeader } from '../types';

const I18N_PATH = 'pages.BatchStatements.BatchStatementsTable.BatchStatementsHeader.';
const BatchStatementsTableHeader: React.FC<IBatchStatementsTableHeader> = ({ onSort }) => {
  const { batchStatementStore } = useStores();

  const { t } = useTranslation();

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      batchStatementStore.checkAll(e.target.checked);
    },
    [batchStatementStore],
  );

  const isAllChecked = batchStatementStore.isAllChecked;
  const checkedBatchStatements = batchStatementStore.checkedBatchStatements;
  const indeterminate = !isAllChecked && checkedBatchStatements.length > 0;

  return (
    <TableTools.Header>
      <TableCheckboxCell
        header
        name="AllBatchStatements"
        onChange={handleCheckAll}
        value={isAllChecked}
        indeterminate={indeterminate}
      />
      <TableTools.SortableHeaderCell
        onSort={onSort}
        store={batchStatementStore}
        sortKey="STATEMENT_DATE"
      >
        {t(`${I18N_PATH}StatementDate`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell onSort={onSort} store={batchStatementStore} sortKey="END_DATE">
        {t(`${I18N_PATH}EndDate`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        onSort={onSort}
        store={batchStatementStore}
        sortKey="COUNT"
        right
      >
        {t(`${I18N_PATH}Count`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        onSort={onSort}
        store={batchStatementStore}
        sortKey="TOTAL"
        right
      >{`${t(`${I18N_PATH}Total`)}, $`}</TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export default observer(BatchStatementsTableHeader);
