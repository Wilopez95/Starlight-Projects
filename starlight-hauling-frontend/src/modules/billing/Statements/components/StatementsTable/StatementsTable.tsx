import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
  TableTools,
} from '../../../../../common/TableTools';
import { hasDataAttribute, isModal } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';

import { StatementPreview } from './StatementPreview/StatementPreview';
import { IStatementsTable } from './types';

const StatementsTable: React.FC<IStatementsTable> = ({ tableRef, onSelect, onSort }) => {
  const { statementStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();

  const selectedStatement = statementStore.selectedEntity;

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      statementStore.checkAll(e.target.checked);
    },
    [statementStore],
  );

  const isAllChecked = statementStore.isAllChecked;
  const checkedStatements = statementStore.checkedStatements;
  const indeterminate = !isAllChecked && checkedStatements.length > 0;

  return (
    <Table ref={tableRef}>
      <TableTools.Header>
        <TableCheckboxCell
          header
          name="AllStatements"
          onChange={handleCheckAll}
          value={isAllChecked}
          indeterminate={indeterminate}
        />
        <TableTools.SortableHeaderCell store={statementStore} onSort={onSort} sortKey="CREATED_AT">
          Created
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={statementStore}
          onSort={onSort}
          sortKey="STATEMENT_DATE"
        >
          Statement Date
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={statementStore} onSort={onSort} sortKey="END_DATE">
          End Date
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={statementStore}
          onSort={onSort}
          sortKey="INVOICES_COUNT"
          center
        >
          Number of invoices
        </TableTools.SortableHeaderCell>
        <TableTools.HeaderCell>Preview</TableTools.HeaderCell>
        <TableTools.SortableHeaderCell
          store={statementStore}
          onSort={onSort}
          sortKey="BALANCE"
          right
        >
          Balance, $
        </TableTools.SortableHeaderCell>
      </TableTools.Header>
      <TableBody loading={statementStore.loading} cells={6} noResult={statementStore.noResult}>
        {statementStore.values.map(item => (
          <TableRow
            key={item.id}
            selected={selectedStatement?.id === item.id}
            onClick={e => {
              if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
                return;
              }

              if (onSelect) {
                onSelect(item);
              } else {
                statementStore.selectEntity(item);
              }
            }}
          >
            <TableCheckboxCell
              name={`statement-${item.id}`}
              onChange={item.check}
              value={item.checked}
            />
            <TableCell>{formatDateTime(item.createdAt as Date).date}</TableCell>
            <TableCell>{formatDateTime(item.statementDate).date}</TableCell>
            <TableCell>{formatDateTime(item.endDate).date}</TableCell>
            <TableCell center>{item.invoicesCount}</TableCell>
            <TableCell>
              <StatementPreview statement={item} />
            </TableCell>
            <TableCell right>
              <Typography fontWeight="bold">{formatCurrency(item.balance)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(StatementsTable);
