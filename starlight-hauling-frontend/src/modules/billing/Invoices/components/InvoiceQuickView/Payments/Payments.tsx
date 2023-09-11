import React from 'react';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { Paths, Routes } from '../../../../../../consts';
import { formatPaymentType, pathToUrl } from '../../../../../../helpers';
import { useBusinessContext, useStores } from '../../../../../../hooks';
import { PaymentType } from '../../../../Payments/types';

const memoOfWriteOffTypes: PaymentType[] = ['creditMemo', 'writeOff'];

const PaymentsTab: React.FC = () => {
  const { invoiceStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { formatCurrency, formatDateTime } = useIntl();
  const loading = invoiceStore.quickViewLoading;

  const currentInvoice = invoiceStore.selectedEntity!;

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell>Payment Date</TableTools.HeaderCell>
        <TableTools.HeaderCell>Type</TableTools.HeaderCell>
        <TableTools.HeaderCell>Payment ID</TableTools.HeaderCell>
        <TableTools.HeaderCell>Payment Form</TableTools.HeaderCell>
        <TableTools.HeaderCell right>Applied Amount, $</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody loading={loading} cells={5} noResult={currentInvoice.payments.length === 0}>
        {currentInvoice.payments.map(payment => {
          const paymentUrl = pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
            customerId: currentInvoice.customer!.id,
            businessUnit: businessUnitId,
            id: payment.id,
            subPath: Routes.Payments,
          });

          return (
            <TableRow key={payment.id}>
              <TableCell>{formatDateTime(payment.date).date}</TableCell>
              <TableCell>
                {memoOfWriteOffTypes.includes(payment.paymentType)
                  ? startCase(payment.paymentType)
                  : 'Payment'}
              </TableCell>
              <TableCell to={paymentUrl}>
                <Typography cursor="pointer" color="information">
                  {payment.id}
                </Typography>
              </TableCell>
              <TableCell>{formatPaymentType(payment)}</TableCell>
              <TableCell right>{formatCurrency(payment.appliedAmount)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default observer(PaymentsTab);
