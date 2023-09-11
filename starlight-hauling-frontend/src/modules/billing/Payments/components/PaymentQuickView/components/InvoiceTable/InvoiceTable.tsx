import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';
import { isEqual, sumBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import currency from 'currency.js';

import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TableTools,
} from '../../../../../../../common/TableTools';
import { useBusinessContext, usePrevious, useStores } from '../../../../../../../hooks';
import { InvoiceStatusEnum, InvoiceType } from '../../../../../types';
import { NewUnappliedPayment } from '../../../../types';
import { InvoiceRow } from '../InvoiceRow/InvoiceRow';

import { IPaymentInvoiceTable } from './types';

const I18N_PATH = 'modules.billing.Payments.components.PaymentQuickView.Text.';

const PaymentInvoiceTable: React.FC<IPaymentInvoiceTable> = ({ isWriteOff }) => {
  const { t } = useTranslation();
  const { invoiceStore, paymentStore, customerStore } = useStores();
  const { values, setValues, setFieldValue } = useFormikContext<NewUnappliedPayment>();
  const { businessUnitId } = useBusinessContext();

  const selectedPayment = paymentStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  const invoicedStatus = selectedPayment?.invoicedStatus;
  const applications = useMemo(
    () => values.notAppliedInvoices?.filter(({ checked }) => checked),
    [values.notAppliedInvoices],
  );
  const isUncheckAll = !!applications?.length;

  const isLoading = invoiceStore.loading && paymentStore.quickViewLoading;
  const unappliedAmount = values.unappliedAmount ?? 0;
  const paymentAmount = values.amount ?? 0;
  const { writeOffCreating } = paymentStore;

  const handleLoadMore = useCallback(() => {
    if (invoicedStatus !== 'applied' && selectedCustomer?.id) {
      invoiceStore.requestByCustomer({
        customerId: selectedCustomer.id,
        filters: {
          canWriteOff: isWriteOff,
          filterByStatus: [InvoiceStatusEnum.open, InvoiceStatusEnum.overdue],
          filterByType: [InvoiceType.financeCharges, InvoiceType.orders, InvoiceType.subscriptions],
        },
      });
    }
  }, [invoiceStore, invoicedStatus, isWriteOff, selectedCustomer?.id]);

  useEffect(() => {
    invoiceStore.cleanup();
    handleLoadMore();
  }, [handleLoadMore, invoiceStore]);

  const prevApplications = usePrevious(applications);

  useEffect(() => {
    if (isEqual(prevApplications, applications)) {
      return;
    }

    const checkedInvoicedAmount =
      sumBy(applications, ({ amount }) => amount ?? 0) +
      sumBy(values.invoices ?? [], ({ amount }) => amount ?? 0);

    // Have to force the unapplied amount to be two decimal places
    const newUnappliedAmount = currency(paymentAmount).subtract(checkedInvoicedAmount);

    setFieldValue('unappliedAmount', newUnappliedAmount);

    if (writeOffCreating) {
      setFieldValue('amount', checkedInvoicedAmount);
      setFieldValue('newBalance', (values?.prevBalance ?? 0) - checkedInvoicedAmount);
    }
  }, [
    applications,
    isUncheckAll,
    paymentAmount,
    prevApplications,
    setFieldValue,
    setValues,
    unappliedAmount,
    values.invoices,
    values?.prevBalance,
    writeOffCreating,
  ]);

  const getInvoiceNewBalance = useCallback(
    (invoiceBalance: number, applicationAmount?: number) =>
      !applicationAmount ? invoiceBalance : currency(invoiceBalance).subtract(applicationAmount),
    [],
  );

  return (
    <TableTools.ScrollContainer>
      <Table>
        <TableTools.Header sticky={false}>
          <TableTools.HeaderCell>{t('Text.Select')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Date`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Invoice`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Status`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}InvoiceAmount`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}AmountDue`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell minWidth={150}>{t(`${I18N_PATH}Applied`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell right>{t(`${I18N_PATH}NewBalance`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={8} loading={isLoading}>
          {values.invoices?.map((invoice, index) => (
            <InvoiceRow
              fieldName={`invoices[${index}]`}
              disabled
              value
              invoice={invoice}
              newBalance={invoice.balance}
              key={invoice.id}
              businessUnitId={businessUnitId}
              isEditable={selectedPayment?.isEditable}
              isPrepay={selectedPayment?.isPrepay}
            />
          ))}
          {values.notAppliedInvoices?.map((invoice, index) => {
            const disabled = unappliedAmount === 0 && !invoice.checked && !writeOffCreating;

            return (
              <InvoiceRow
                fieldName={`notAppliedInvoices[${index}]`}
                disabled={disabled}
                value={!!invoice.checked}
                invoice={invoice}
                newBalance={getInvoiceNewBalance(invoice.balance, invoice.amount)}
                key={invoice.id}
                businessUnitId={businessUnitId}
                isEditable={selectedPayment?.isEditable}
                isPrepay={selectedPayment?.isPrepay}
                isWriteOff={writeOffCreating}
              />
            );
          })}
        </TableBody>
      </Table>
      {invoicedStatus !== 'applied' ? (
        <TableInfiniteScroll
          loaded={invoiceStore.loaded}
          loading={invoiceStore.loading}
          initialRequest={false}
          onLoaderReached={handleLoadMore}
        >
          {t('Text.Loading')}
        </TableInfiniteScroll>
      ) : null}
    </TableTools.ScrollContainer>
  );
};

export default observer(PaymentInvoiceTable);
