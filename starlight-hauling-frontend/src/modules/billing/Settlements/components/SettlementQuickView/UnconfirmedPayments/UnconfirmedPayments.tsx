import React from 'react';
import { useTranslation } from 'react-i18next';

import { formatPaymentType } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { type ManuallyCreatablePayment } from '@root/modules/billing/Payments/types';

import { Typography } from '../../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';

const I18N_PATH =
  'modules.billing.Settlements.components.SettlementQuickView.UnconfirmedPayments.Text.';

const UnconfirmedPayments: React.FC<{ payments: ManuallyCreatablePayment[] }> = ({ payments }) => {
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell>{t('Text.Customer')}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}PaymentType`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t(`${I18N_PATH}TransactionDate`)}</TableTools.HeaderCell>
        <TableTools.HeaderCell right>{t(`${I18N_PATH}Amount`)}</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody cells={4} loading={false} noResult={!payments.length}>
        {payments.map(payment => (
          <TableRow key={payment.id}>
            <TableCell>{payment.customer?.name}</TableCell>
            <TableCell>{formatPaymentType(payment)}</TableCell>
            <TableCell>{formatDateTime(payment.date).date}</TableCell>
            <TableCell right>
              <Typography variant="bodyMedium" fontWeight="bold">
                {formatCurrency(payment.amount)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UnconfirmedPayments;
