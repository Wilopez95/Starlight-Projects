import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { sumBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { mathRound2 } from '@root/helpers';

import {
  Table,
  TableBody,
  TableCheckboxCell,
  TableTools,
} from '../../../../../../../common/TableTools';
import { useStores } from '../../../../../../../hooks';
import { Payment } from '../../../../../Payments/store/Payment';
import { NewPayout } from '../../../../types';
import { PaymentRow } from '../PaymentRow/PaymentRow';

const I18N_PATH = 'modules.billing.Payouts.Text.';

const PaymentInvoiceTable: React.FC = () => {
  const { paymentStore, payoutStore } = useStores();
  const { values, setValues } = useFormikContext<NewPayout>();
  const { t } = useTranslation();
  const payments = paymentStore.values.filter(payment => payment.invoicedStatus === 'unapplied');

  const isAllChecked =
    values.selectedPayments.length === payments.length &&
    payments.length > 0 &&
    !payoutStore.loading;

  const indeterminate = !isAllChecked && values.selectedPayments.length > 0;

  const isLoading = paymentStore.loading && payoutStore.quickViewLoading;

  const handleClickAll = useCallback(() => {
    let amount = 0;
    let newSelectedPayments: Payment[] = [];

    if (values.selectedPayments.length === 0) {
      amount = mathRound2(sumBy(payments, payment => payment.unappliedAmount ?? 0));
      newSelectedPayments = [...payments];
    }
    setValues({
      ...values,
      amount,
      selectedPayments: newSelectedPayments,
    });
  }, [payments, setValues, values]);

  const handleClickPayment = useCallback(
    (payment: Payment, isSelected: boolean) => {
      let newPayments = [];

      if (isSelected) {
        newPayments = values.selectedPayments.filter(pay => pay.id !== payment.id);
      } else {
        newPayments = [...values.selectedPayments, payment];
      }

      setValues({
        ...values,
        selectedPayments: newPayments,
        amount: mathRound2(sumBy(newPayments, pay => pay.unappliedAmount ?? 0)),
      });
    },
    [setValues, values],
  );

  const headerCheckboxDisabled = !isLoading && payments.length === 0;

  return (
    <TableTools.ScrollContainer>
      <Table>
        <TableTools.Header sticky={false}>
          <TableCheckboxCell
            header
            indeterminate={indeterminate}
            onChange={handleClickAll}
            name="AllPayments"
            value={isAllChecked}
            disabled={headerCheckboxDisabled}
          />
          <TableTools.HeaderCell>{t('Text.Date')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t('Text.Type')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}PaymentForm`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell right>{t(`${I18N_PATH}Unapplied`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={8} loading={isLoading}>
          {values.payments?.map(payment => (
            <PaymentRow disabled checked payment={payment} key={payment.id} />
          ))}
          {payments.map(payment => {
            const selectedPayment = values.selectedPayments.find(x => x.id === payment.id);

            return (
              <PaymentRow
                disabled={!!payoutStore.selectedEntity}
                checked={!!selectedPayment}
                payment={payment}
                key={payment.id}
                onChange={() => handleClickPayment(payment, !!selectedPayment)}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableTools.ScrollContainer>
  );
};

export default observer(PaymentInvoiceTable);
