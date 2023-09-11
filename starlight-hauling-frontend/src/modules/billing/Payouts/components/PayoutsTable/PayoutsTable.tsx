import React from 'react';
import { observer } from 'mobx-react-lite';

import { formatPaymentType } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../common/TableTools';
import { useStores } from '../../../../../hooks';

import { IPayoutsTable } from './types';

const PayoutsTable: React.FC<IPayoutsTable> = ({ showCustomer, tableRef, onSelect, onSort }) => {
  const { payoutStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();

  const selectedPayout = payoutStore.selectedEntity;

  return (
    <Table ref={tableRef}>
      <TableTools.Header>
        <TableTools.SortableHeaderCell sortKey="DATE" onSort={onSort} store={payoutStore}>
          Date
        </TableTools.SortableHeaderCell>
        {showCustomer ? (
          <>
            <TableTools.SortableHeaderCell sortKey="CUSTOMER" onSort={onSort} store={payoutStore}>
              Customer
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell sortKey="PAYOUT_ID" onSort={onSort} store={payoutStore}>
              Payout ID
            </TableTools.SortableHeaderCell>
          </>
        ) : null}
        <TableTools.HeaderCell>Type</TableTools.HeaderCell>
        <TableTools.SortableHeaderCell sortKey="PAYMENT_FORM" onSort={onSort} store={payoutStore}>
          Payment Form
        </TableTools.SortableHeaderCell>
        {/** TODO Replace for DEPOSIT after implementing*/}
        <TableTools.SortableHeaderCell sortKey="DEPOSIT" onSort={onSort} store={payoutStore}>
          Deposit
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell sortKey="AMOUNT" onSort={onSort} store={payoutStore} right>
          Amount, $
        </TableTools.SortableHeaderCell>
      </TableTools.Header>
      <TableBody
        loading={payoutStore.loading}
        cells={showCustomer ? 7 : 5}
        noResult={payoutStore.noResult}
      >
        {payoutStore.values.map(item => (
          <TableRow
            key={item.id}
            onClick={() => onSelect(item)}
            selected={selectedPayout?.id === item.id}
          >
            <TableCell>{formatDateTime(item.date).date}</TableCell>
            {showCustomer ? (
              <>
                <TableCell>{item.customer?.name}</TableCell>
                <TableCell>{item.id}</TableCell>
              </>
            ) : null}
            <TableCell>Payout</TableCell>
            <TableCell>{formatPaymentType(item)}</TableCell>
            <TableCell>{formatDateTime(item.date).date}</TableCell>

            <TableCell right>
              <Typography fontWeight="bold">{formatCurrency(item.amount)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(PayoutsTable);
