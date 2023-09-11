import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, FormContainer, Typography, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Divider, TableQuickView, withQuickView } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { IQuickView, IQuickViewLeftPanel } from '@root/customer/quickViews/types';
import { NewUnappliedPayment } from '@root/finance/types/entities';

import * as QuickViewStyles from '../styles';

import { LeftPanel } from './LeftPanel/LeftPanel';
import PaymentForm from './PaymentForm/PaymentForm';
import { getValues, validationSchema } from './formikData';

const I18N_PATH = 'modules.finance.components.InvoicePaymentQuickView.';

const PaymentQuickView: React.FC<IQuickViewLeftPanel & IQuickView> = ({
  tableContainerRef,
  onReload,
}) => {
  const { customerStore, paymentStore, invoiceStore, creditCardStore } = useStores();
  const { t } = useTranslation();
  const selectedCustomer = customerStore.selectedEntity;
  const selectedPayment = paymentStore.selectedEntity;
  const invoicedStatus = selectedPayment?.invoicedStatus;

  useEffect(() => {
    if (selectedCustomer) {
      creditCardStore.request({ customerId: selectedCustomer.id });
    }
  }, [creditCardStore, selectedCustomer]);
  const paymentUnapplied = invoicedStatus === 'unapplied';

  const formik = useFormik({
    validationSchema: validationSchema(t),
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: getValues({
      balance: selectedCustomer?.balance ?? 0,
      invoices: invoiceStore.checkedInvoices,
    }),
    onSubmit: noop,
  });
  const { validateForm, values } = formik;
  const handlePaymentChange = useCallback(
    async (values: NewUnappliedPayment, onCancel: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }
      const payment = selectedPayment;

      const { applications } = values;

      if (!payment && selectedCustomer?.id) {
        const newPayment = await paymentStore.createUnappliedPayment(values);

        if (newPayment) {
          paymentStore.cleanup();
          paymentStore.requestByCustomer(+selectedCustomer?.id);
        }
      } else if (paymentUnapplied && payment) {
        paymentStore.applyPayment(payment.id, applications);
      }
      if (onReload) {
        onReload();
      }
      onCancel();
    },
    [validateForm, selectedPayment, selectedCustomer?.id, paymentUnapplied, paymentStore, onReload],
  );

  return (
    <>
      <TableQuickView
        parentRef={tableContainerRef}
        clickOutContainers={tableContainerRef}
        store={paymentStore}
        size='three-quarters'
        onCancel={paymentStore.closeQuickView}
      >
        {({ onCancel, onAddRef, scrollContainerHeight }) => (
          <QuickViewStyles.Wrapper as={FormContainer} formik={formik}>
            <QuickViewStyles.CrossIcon onClick={onCancel} />
            <QuickViewStyles.Container>
              <LeftPanel />
              <Layouts.Scroll height={scrollContainerHeight}>
                <QuickViewStyles.RightPanel>
                  <Typography variant='headerThree'>{t(`${I18N_PATH}PaymentDetails`)}</Typography>
                  <PaymentForm />
                </QuickViewStyles.RightPanel>
              </Layouts.Scroll>
            </QuickViewStyles.Container>
            <QuickViewStyles.ButtonContainer ref={onAddRef}>
              <Divider bottom />
              <Layouts.Flex justifyContent='space-between'>
                <Layouts.Column>
                  <Button onClick={onCancel}>{t(`${I18N_PATH}Cancel`)}</Button>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Flex justifyContent='flex-end'>
                    <Layouts.Margin left='2'>
                      <Button
                        variant='success'
                        onClick={() => handlePaymentChange(values, onCancel)}
                      >
                        {t(`${I18N_PATH}CreatePayment`)}
                      </Button>
                    </Layouts.Margin>
                  </Layouts.Flex>
                </Layouts.Column>
              </Layouts.Flex>
            </QuickViewStyles.ButtonContainer>
          </QuickViewStyles.Wrapper>
        )}
      </TableQuickView>
    </>
  );
};

export default withQuickView(observer(PaymentQuickView));
