import React from 'react';
import { useTranslation } from 'react-i18next';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Badge } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../common/TableTools';
import { formatPaymentType, getPaymentInvoicedStatusColor } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';
import { PaymentType } from '../../types';

import { IPaymentsTable } from './types';

const memoOfWriteOffTypes: PaymentType[] = ['creditMemo', 'writeOff'];

const I18N_PATH = 'components.PaymentsTable.Text.';

const PaymentsTable: React.FC<IPaymentsTable> = ({ showCustomer, tableRef, onSelect, onSort }) => {
  const { paymentStore } = useStores();
  const { formatDateTime, formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();

  const selectedPayment = paymentStore.selectedEntity;

  return (
    <Table ref={tableRef}>
      <TableTools.Header>
        <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="DATE">
          {t(`${I18N_PATH}Date`)}
        </TableTools.SortableHeaderCell>
        {showCustomer ? (
          <>
            <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="CUSTOMER">
              {t(`${I18N_PATH}Customer`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={paymentStore}
              onSort={onSort}
              sortKey="PAYMENT_ID"
            >
              {t(`${I18N_PATH}PaymentID`)}
            </TableTools.SortableHeaderCell>
          </>
        ) : null}

        <TableTools.HeaderCell>{t(`${I18N_PATH}Type`)}</TableTools.HeaderCell>
        <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="PAYMENT_FORM">
          {t(`${I18N_PATH}PaymentForm`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="DEPOSIT_DATE">
          {t(`${I18N_PATH}Deposit`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="STATUS">
          {t(`${I18N_PATH}Status`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={paymentStore}
          onSort={onSort}
          sortKey="UNAPPLIED"
          right
        >
          {t(`${I18N_PATH}Unapplied`, { currencySymbol })}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={paymentStore} onSort={onSort} sortKey="AMOUNT" right>
          {t(`${I18N_PATH}Amount`, { currencySymbol })}
        </TableTools.SortableHeaderCell>
      </TableTools.Header>
      <TableBody
        loading={paymentStore.loading}
        cells={showCustomer ? 9 : 7}
        noResult={paymentStore.noResult}
      >
        {paymentStore.values.map(item => (
          <TableRow
            key={item.id}
            onClick={() => onSelect(item)}
            selected={selectedPayment?.id === item.id}
          >
            <TableCell>{formatDateTime(item.date).date}</TableCell>
            {showCustomer ? (
              <>
                <TableCell>{item.customer?.name}</TableCell>
                <TableCell>{item.id}</TableCell>
              </>
            ) : null}
            <TableCell>
              {memoOfWriteOffTypes.includes(item.paymentType)
                ? startCase(item.paymentType)
                : t(`${I18N_PATH}Payment`)}
            </TableCell>
            <TableCell>{formatPaymentType(item)}</TableCell>
            <TableCell>
              {item?.bankDepositDate ? formatDateTime(item.bankDepositDate).date : null}
            </TableCell>
            <TableCell>
              <Badge color={getPaymentInvoicedStatusColor(item.invoicedStatus)}>
                {startCase(item.invoicedStatus)}
              </Badge>
            </TableCell>
            <TableCell right>{formatCurrency(item.unappliedAmount)}</TableCell>
            <TableCell right>{formatCurrency(item.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(PaymentsTable);
