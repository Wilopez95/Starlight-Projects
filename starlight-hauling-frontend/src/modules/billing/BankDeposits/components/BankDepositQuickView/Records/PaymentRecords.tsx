import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIntl } from '@root/i18n/useIntl';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';
import { BankDepositType } from '../../../types';

import { generateDescription } from './helpers';
import { IPaymentRecordsTable } from './types';

export const PaymentRecords: React.FC<IPaymentRecordsTable> = ({ payments }) => {
  const { bankDepositStore } = useStores();
  const { formatDateTime, formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();

  const currentBankDeposit = bankDepositStore.selectedEntity;

  return (
    <Table>
      <TableTools.Header>
        <TableTools.HeaderCell>{t('Text.Date')}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t('Text.Customer')}</TableTools.HeaderCell>
        <TableTools.HeaderCell>{t('Text.Description')}</TableTools.HeaderCell>
        <TableTools.HeaderCell right>{t('Text.AmountP', { currencySymbol })}</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody cells={4} loading={bankDepositStore.loading} noResult={!payments?.length}>
        {payments?.map(payment => (
          <TableRow key={payment.id}>
            <TableCell>{formatDateTime(payment.date).date}</TableCell>
            <TableCell>{payment.customer?.name ?? ''}</TableCell>
            <TableCell>{generateDescription(payment)}</TableCell>
            <TableCell right>
              {formatCurrency(
                currentBankDeposit?.depositType === BankDepositType.reversal && payment.reverseData
                  ? payment.reverseData.amount
                  : payment.amount,
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
