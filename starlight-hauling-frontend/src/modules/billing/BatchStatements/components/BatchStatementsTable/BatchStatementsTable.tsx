import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
} from '../../../../../common/TableTools';
import { hasDataAttribute } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';

import BatchStatementsTableHeader from './BatchStatementsHeader/BatchStatementsHeader';
import { type IBatchStatementsTable } from './types';

const BatchStatementsTable: React.FC<IBatchStatementsTable> = ({
  onSelect,
  onSort,
  tableBodyContainer,
}) => {
  const { batchStatementStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  return (
    <Table ref={tableBodyContainer}>
      <Helmet title={t('Titles.BatchStatements')} />
      <BatchStatementsTableHeader onSort={onSort} />
      <TableBody
        loading={batchStatementStore.loading}
        cells={5}
        noResult={batchStatementStore.noResult}
      >
        {batchStatementStore.values.map(batchStatement => {
          return (
            <TableRow
              key={batchStatement.id}
              selected={batchStatementStore.selectedEntity?.id === batchStatement.id}
              onClick={e => {
                if (hasDataAttribute(e, 'skipEvent')) {
                  return;
                }
                onSelect(batchStatement);
              }}
            >
              <TableCheckboxCell
                name={`statement-${batchStatement.id}`}
                onChange={batchStatement.check}
                value={batchStatement.checked}
              />
              <TableCell>{formatDateTime(batchStatement.statementDate).date}</TableCell>
              <TableCell>{formatDateTime(batchStatement.endDate).date}</TableCell>
              <TableCell right>{batchStatement.count}</TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(batchStatement.total)}</Typography>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default observer(BatchStatementsTable);
