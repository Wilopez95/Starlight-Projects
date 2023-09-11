/* eslint-disable complexity */ // disabled because it will need a huge refactor
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import { find, isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  QuickViewConfirmModal,
  QuickViewContent,
  useQuickViewContext,
} from '@root/common/QuickView';
import { dateFormatsEnUS } from '@root/i18n/format/date';
import { useIntl } from '@root/i18n/useIntl';

import { Protected, Typography } from '../../../../../common';
import { FormContainer } from '../../../../../components';
import {
  useBoolean,
  useCleanup,
  usePermission,
  useScrollOnError,
  useStores,
} from '../../../../../hooks';
import { NewUnappliedPayment, PaymentApplication, PaymentType } from '../../types';
import RefundUnappliedPaymentModal from '../RefundUnappliedPayment/RefundUnappliedPayment';
import { IRefundUnappliedPaymentData } from '../RefundUnappliedPayment/types';
import ReversePaymentModal from '../ReversePayment/ReversePayment';
import { IReversePaymentData } from '../ReversePayment/types';

import { LeftPanel, PaymentForm } from './components';
import { generateValidationSchema, getValues } from './formikData';

const PaymentQuickViewContent: React.FC<{ showCustomer: boolean }> = ({ showCustomer }) => {
  const { customerStore, paymentStore, invoiceStore, creditCardStore } = useStores();
  const [isSubmitting, setSubmitting] = useState(false);
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const intl = useIntl();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedPayment = paymentStore.selectedEntity;
  const selectedInvoice = invoiceStore.selectedEntity;

  const paymentId = selectedPayment?.id;
  const isNew = !selectedPayment;

  const invoicedStatus = selectedPayment?.invoicedStatus;
  const paymentApplied = invoicedStatus === 'applied';
  const paymentUnapplied = invoicedStatus === 'unapplied';
  const paymentReversed = invoicedStatus === 'reversed';

  const isMemo = paymentStore.memoPaymentCreating || selectedPayment?.paymentType === 'creditMemo';
  const isWriteOff = paymentStore.writeOffCreating || selectedPayment?.paymentType === 'writeOff';
  const isRefundOnAccount =
    (selectedPayment?.paymentType as PaymentType | 'refundOnAccount') === 'refundOnAccount';

  const showRefundButton =
    paymentUnapplied &&
    selectedPayment?.unappliedAmount &&
    selectedPayment?.paymentType === 'creditCard';

  const formik = useFormik<NewUnappliedPayment>({
    validationSchema: generateValidationSchema(intl),
    validateOnChange: false,
    initialValues: getValues({
      balance: selectedCustomer?.balance ?? 0,
      payment: selectedPayment,
      invoice: selectedInvoice,
      isMemo,
      isWriteOff,
      notAppliedInvoices: invoiceStore.values.map(invoiceStore.getUnObservedEntity) ?? [],
    }),
    onSubmit: noop,
  });

  const { errors, validateForm, values, isValidating, setFieldValue } = formik;

  useEffect(() => {
    setFieldValue('notAppliedInvoices', invoiceStore.values.map(invoiceStore.getUnObservedEntity));
  }, [invoiceStore.values]);

  useScrollOnError(errors, !isValidating);
  useCleanup(invoiceStore);

  const [isReversePaymentModalOpen, openReversePaymentModal, closeReversePaymentModal] =
    useBoolean();

  const [isRefundPaymentModalOpen, openRefundPaymentModal, closeRefundPaymentModal] = useBoolean();

  const getReverseData = ({
    reversalDate,
    comment,
    reversalType,
    paymentAmount,
  }: IReversePaymentData) => ({
    date: reversalDate,
    note: comment,
    type: reversalType,
    amount: paymentAmount,
  });

  const handleReversePaymentSubmit = useCallback(
    async (data: IReversePaymentData) => {
      if (paymentId) {
        await paymentStore.reversePayment(paymentId, getReverseData(data));
      }
      closeReversePaymentModal();
    },
    [paymentStore, closeReversePaymentModal, paymentId],
  );

  const handleRefundPaymentSubmit = useCallback(
    async (data: IRefundUnappliedPaymentData) => {
      if (paymentId) {
        await paymentStore.refundUnappliedPayment(
          paymentId,
          Number.parseFloat(data.refundAmount.toString()),
        );
      }
      closeRefundPaymentModal();
    },
    [paymentStore, closeRefundPaymentModal, paymentId],
  );

  const setSelectedCustomer = useCallback(async () => {
    if (!selectedCustomer && (selectedPayment?.customer || selectedInvoice?.customer)) {
      await customerStore.requestById(
        selectedPayment?.customer.id ?? selectedInvoice?.customer?.id ?? 0,
      );
    }
  }, [customerStore, selectedCustomer, selectedPayment, selectedInvoice]);

  useEffect(() => {
    setSelectedCustomer();
  }, [setSelectedCustomer]);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    if (isNew) {
      creditCardStore.requestRelevant({ customerId: selectedCustomer.id });
    } else if (selectedPayment?.paymentType === 'creditCard' && selectedPayment?.creditCard?.id) {
      creditCardStore.requestById(selectedPayment.creditCard.id.toString());
    }
  }, [
    creditCardStore,
    isNew,
    selectedCustomer,
    selectedCustomer?.id,
    selectedPayment?.creditCard?.id,
    selectedPayment?.paymentType,
  ]);

  const canUpdateCreditMemos = usePermission('billing/payments:credit-memo:perform');

  const applications = values.notAppliedInvoices?.filter(invoice => invoice.checked);

  const appliedInvoicesApplications = useMemo(
    () =>
      values.invoices?.filter(invoice => {
        const initInvoice = find(selectedPayment?.invoices, ['id', invoice.id]);

        return invoice.amount !== initInvoice?.amount;
      }),
    [selectedPayment?.invoices, values.invoices],
  );

  const handlePaymentChange = useCallback(
    async (valuesData: NewUnappliedPayment) => {
      const formErrors = await validateForm();
      const payment = selectedPayment;

      if (!isEmpty(formErrors)) {
        return;
      }
      setSubmitting(true);
      const { notAppliedInvoices = [], writeOffNote = '' } = valuesData;
      const applicationsData = [
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...notAppliedInvoices?.filter(invoice => invoice.checked),
        ...(appliedInvoicesApplications ?? []),
      ];

      if (!payment && selectedCustomer?.id) {
        const newPayment = isWriteOff
          ? await paymentStore.writeOffInvoices({
              invoiceIds: applicationsData.map(({ id }) => id),
              customerId: selectedCustomer.id,
              note: writeOffNote,
              date: format(valuesData.date, dateFormatsEnUS.ISO),
            })
          : await paymentStore.createUnappliedPayment(valuesData);

        if (newPayment) {
          paymentStore.cleanup();
          paymentStore.requestByCustomer(+selectedCustomer?.id);
        }
      } else {
        if (isMemo && canUpdateCreditMemos) {
          await paymentStore.updateMemoPayment(valuesData);
        }

        const paymentApplications: PaymentApplication[] = applicationsData.map(application => ({
          invoiceId: application.id,
          amount: application.amount,
        }));

        if (!isEmpty(applicationsData) && payment?.id) {
          paymentStore.applyPayment(payment.id, paymentApplications);
        }
      }

      forceCloseQuickView();
    },
    [
      validateForm,
      selectedPayment,
      appliedInvoicesApplications,
      selectedCustomer?.id,
      forceCloseQuickView,
      isWriteOff,
      paymentStore,
      isMemo,
      canUpdateCreditMemos,
    ],
  );

  const handleDelete = useCallback(() => {
    if (paymentId) {
      paymentStore.deleteMemoPayment(paymentId);
    }
    forceCloseQuickView();
  }, [paymentId, paymentStore, forceCloseQuickView]);

  let buttonLabels;

  if (isMemo) {
    buttonLabels = {
      create: 'Create Memo Payment',
      apply: 'Save',
    };
  } else if (isWriteOff) {
    buttonLabels = {
      create: 'Create Write Off',
      apply: '',
    };
  } else {
    buttonLabels = {
      create: 'Create Payment',
      apply: 'Apply Payment',
    };
  }

  const applyButtonText = isNew ? buttonLabels.create : buttonLabels.apply;
  const applyButtonColor = !isNew && isMemo ? 'primary' : 'success';

  const shouldRenderCancelButton =
    isNew || (!paymentApplied && !paymentReversed && values.paymentType !== 'creditMemo');

  return (
    <FormContainer formik={formik}>
      <ReversePaymentModal
        isOpen={isReversePaymentModalOpen}
        onClose={closeReversePaymentModal}
        onFormSubmit={handleReversePaymentSubmit}
      />
      <RefundUnappliedPaymentModal
        isOpen={isRefundPaymentModalOpen}
        onClose={closeRefundPaymentModal}
        onFormSubmit={handleRefundPaymentSubmit}
      />
      <QuickViewContent
        dirty={formik.dirty}
        confirmModal={<QuickViewConfirmModal />}
        leftPanelElement={<LeftPanel showCustomer={showCustomer} />}
        rightPanelElement={
          <Layouts.Scroll>
            <Layouts.Padding padding="3">
              <Typography variant="headerThree">
                {isWriteOff ? 'Write Off Details' : 'Payment Details'}
              </Typography>
              <PaymentForm viewMode={!isNew} isMemo={isMemo} isWriteOff={isWriteOff} />
            </Layouts.Padding>
          </Layouts.Scroll>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            <Layouts.Column>
              {shouldRenderCancelButton ? <Button onClick={closeQuickView}>Cancel</Button> : null}
              {!paymentApplied && !isNew && values.paymentType === 'creditMemo' ? (
                <Protected permissions="billing/payments:credit-memo:perform">
                  <Button onClick={handleDelete}>Delete</Button>
                </Protected>
              ) : null}
            </Layouts.Column>
            <Layouts.Column>
              <Layouts.Flex justifyContent="flex-end">
                {!isMemo && !isNew && !paymentReversed && !isWriteOff && !isRefundOnAccount ? (
                  <Protected permissions="billing/payments:reverse:perform">
                    <Button variant="converseAlert" onClick={openReversePaymentModal}>
                      Reverse payment
                    </Button>
                  </Protected>
                ) : null}

                {showRefundButton ? (
                  <Protected permissions="billing/payments:refund:perform">
                    <Layouts.Margin left="2">
                      <Button onClick={openRefundPaymentModal}>Refund Unapplied</Button>
                    </Layouts.Margin>
                  </Protected>
                ) : null}

                <Layouts.Margin left="2">
                  {paymentUnapplied || selectedPayment?.isEditable || isNew ? (
                    <Button
                      variant={applyButtonColor}
                      disabled={
                        isSubmitting ||
                        (!isMemo &&
                          !isNew &&
                          isEmpty(applications) &&
                          isEmpty(appliedInvoicesApplications)) ||
                        (isWriteOff && !values.amount)
                      }
                      onClick={() => handlePaymentChange(values)}
                    >
                      {applyButtonText}
                    </Button>
                  ) : (
                    <Button onClick={closeQuickView}>Close Details</Button>
                  )}
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Column>
          </Layouts.Flex>
        }
      />
    </FormContainer>
  );
};

export default observer(PaymentQuickViewContent);
