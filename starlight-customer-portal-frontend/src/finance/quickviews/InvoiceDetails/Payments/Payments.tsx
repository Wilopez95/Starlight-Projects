import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableHeadCell,
  TableHeader,
  TableRow,
} from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { formatPaymentType } from '@root/finance/helpers';
import { PaymentType } from '@root/finance/types/entities';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.PaymentsTab.';
const memoOrWriteOffTypes: PaymentType[] = ['creditMemo', 'writeOff'];

const PaymentsTab: React.FC = () => {
  const { invoiceStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  const loading = invoiceStore.quickViewLoading;

  const currentInvoice = invoiceStore.selectedEntity!;

  return (
    <Table>
      <TableHeader>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}PaymentDate`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}Type`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}PaymentID`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}PaymentForm`)}
          </Typography>
        </TableHeadCell>
        <TableHeadCell right>
          <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}AppliedAmount`)}
          </Typography>
        </TableHeadCell>
      </TableHeader>
      <TableBody loading={loading} cells={5} noResult={currentInvoice.payments.length === 0}>
        {currentInvoice.payments.map((payment) => {
          return (
            <TableRow key={payment.id}>
              <TableCell>{formatDateTime(payment.date).date}</TableCell>
              <TableCell>
                {memoOrWriteOffTypes.includes(payment.paymentType)
                  ? startCase(payment.paymentType)
                  : 'Payment'}
              </TableCell>
              <TableCell>
                <Typography cursor='pointer' color='information'>
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
