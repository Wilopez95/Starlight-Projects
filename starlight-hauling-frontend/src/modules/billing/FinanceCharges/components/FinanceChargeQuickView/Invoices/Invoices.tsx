import React from 'react';
import { differenceInDays } from 'date-fns';
import { format } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';

import { parseDate, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

const InvoicesTab: React.FC = () => {
  const { financeChargeStore } = useStores();
  const { formatCurrency, dateFormat } = useIntl();
  const loading = financeChargeStore.quickViewLoading;

  const currentFinCharge = financeChargeStore.selectedEntity;

  return (
    <Table>
      <TableTools.Header sticky={false}>
        <TableTools.HeaderCell>Invoice#</TableTools.HeaderCell>
        <TableTools.HeaderCell>Invoice Due</TableTools.HeaderCell>
        <TableTools.HeaderCell>Invoice Paid</TableTools.HeaderCell>
        <TableTools.HeaderCell>Overdue</TableTools.HeaderCell>
        <TableTools.HeaderCell right>Balance, $</TableTools.HeaderCell>
        <TableTools.HeaderCell right>Charge, $</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody loading={loading} cells={6} noResult={currentFinCharge?.invoices.length === 0}>
        {currentFinCharge?.invoices.map(invoice => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.id}</TableCell>
            <TableCell>
              {invoice.dueDate ? format(invoice.dueDate, dateFormat.date) : null}
            </TableCell>
            <TableCell>{format(parseDate(invoice.createdAt), dateFormat.date)}</TableCell>
            <TableCell>
              {invoice.dueDate && currentFinCharge?.statement
                ? `${differenceInDays(
                    substituteLocalTimeZoneInsteadUTC(currentFinCharge.statement.statementDate),
                    substituteLocalTimeZoneInsteadUTC(invoice.dueDate),
                  )} days`
                : '-'}
            </TableCell>
            <TableCell right>{formatCurrency(invoice.balance)}</TableCell>
            <TableCell right>{formatCurrency(invoice.fine)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(InvoicesTab);
