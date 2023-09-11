import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Layouts, Select, TextInput } from '@starlightpro/shared-components';
import { FormikProvider, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ActionCode } from '@root/helpers/notifications/types';

import { ApiError } from '../../../../../../../api/base/ApiError';
import { FormInput, Typography } from '../../../../../../../common';
import { Divider } from '../../../../../../../common/TableTools';
import {
  formatCreditCard,
  formatPaymentType,
  NotificationHelper,
} from '../../../../../../../helpers';
import { useDateIntl } from '../../../../../../../helpers/format/date';
import { useStores } from '../../../../../../../hooks';
import { useIntl } from '../../../../../../../i18n/useIntl';
import { PaymentService } from '../../../../../Payments/api/payment';
import { RefundType } from '../../../../../Payments/types';
import { ScrollableFormWrapper } from '../../styles';
import { ActionButtonContainer } from '../ActionButtonContainer/ActionButtonContainer';
import { OverpaidOrderTable } from '../OrderTables';

import { generateValidationSchema, getValues } from './formikData';
import { type ICreateRefund } from './types';

const CreateRefund: React.FC<ICreateRefund> = ({
  currentCustomer,
  onRefundCanceled,
  onRefundCreated,
}) => {
  const overpaidOrders = Object.values(currentCustomer.overpaidOrders);

  const totalOverpaid = overpaidOrders.reduce((acc, order) => acc + order.overpaidAmount, 0);

  const { creditCardStore } = useStores();
  const { formatCurrency, firstDayOfWeek } = useIntl();
  const { t } = useTranslation();
  const formik = useFormik({
    validationSchema: generateValidationSchema(overpaidOrders),
    validateOnChange: false,
    initialValues: getValues(currentCustomer),
    onSubmit: noop,
  });

  const { values, handleChange, setValues, errors, validateForm } = formik;

  const selectedOrder = currentCustomer.overpaidOrders[values.orderId];

  const refundablePayments = selectedOrder.payments.filter(payment => Number(payment.amount) > 0);

  const selectedPayment = selectedOrder.payments.find(
    payment => payment.id === values.refundedPaymentId,
  );

  useEffect(() => {
    creditCardStore.request({ customerId: currentCustomer.id });
  }, [creditCardStore, currentCustomer.id]);

  const [loading, setLoading] = useState(false);

  const creditCardOptions = creditCardStore.values.map(creditCard => ({
    label: formatCreditCard(creditCard),
    value: creditCard.id,
  }));

  const refundTypeOptions = useMemo(() => {
    const options = [
      { label: 'On Account', value: 'ON_ACCOUNT' },
      { label: 'Check', value: 'CHECK' },
    ];

    if (selectedPayment?.creditCardId) {
      options.push({ label: 'Credit Card', value: 'CREDIT_CARD' });
    }

    return options;
  }, [selectedPayment?.creditCardId]);

  const refundedPaymentOptions = refundablePayments.map(payment => ({
    label: formatPaymentType(payment),
    value: payment.id,
    hint: formatCurrency(payment.amount),
  }));

  const handleRefundTypeChange = useCallback(
    (_: string, value: RefundType) => {
      setValues({
        refundedPaymentId: values.refundedPaymentId,
        orderId: values.orderId,
        amount: values.amount,
        refundType: value,
        checkNumber: undefined,
      });
    },
    [setValues, values],
  );

  const handleOrderSelected = useCallback(
    (orderId: number) => {
      const order = overpaidOrders.find(orderInfo => orderInfo.id === orderId);

      if (order) {
        setValues({
          orderId,
          amount: 0,
          refundedPaymentId: order.payments[0].id,
          refundType: order?.creditCardId ? 'CREDIT_CARD' : 'CHECK',
          checkNumber: undefined,
        });
      }
    },
    [overpaidOrders, setValues],
  );

  const handleRefundedPaymentChange = useCallback(
    (_, paymentId: number) => {
      const payment = selectedOrder.payments.find(paymentInfo => paymentInfo.id === paymentId);

      if (payment) {
        setValues({
          orderId: values.orderId,
          amount: 0,
          refundedPaymentId: paymentId,
          refundType: payment.paymentType === 'creditCard' ? 'CREDIT_CARD' : 'CHECK',
          checkNumber: undefined,
        });
      }
    },
    [selectedOrder.payments, setValues, values.orderId],
  );

  const handleRefundCreate = async () => {
    setLoading(true);

    const errorsData = await validateForm();

    if (!isEmpty(errorsData)) {
      setLoading(false);

      return;
    }

    try {
      await PaymentService.refundPrepaidOrder({ ...values });

      onRefundCreated(values.orderId, values.refundedPaymentId, values.amount);
      NotificationHelper.success('refundPrepaidOrder');
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if (castedError?.response?.errors?.find(err => err?.extensions?.details === 412)) {
        NotificationHelper.error('refundPrepaidOrder', ActionCode.PRECONDITION_FAILED);
      } else {
        NotificationHelper.error('refundPrepaidOrder', castedError.response.code as ActionCode);
      }
    }

    setLoading(false);
  };

  const { dateFormat } = useDateIntl();

  return (
    <>
      <Layouts.Flex justifyContent="space-between">
        <Typography variant="headerFour">Overpaid Total</Typography>
        <Typography color="primary">{formatCurrency(totalOverpaid)}</Typography>
      </Layouts.Flex>
      <Layouts.Flex justifyContent="space-between">
        <Typography color="secondary">{overpaidOrders.length} Order(s)</Typography>
        <Typography color="secondary">Total overpaid</Typography>
      </Layouts.Flex>
      <Layouts.Margin top="1" bottom="1">
        <Typography color="secondary">
          Create a refund payment for individual overpaid orders.
        </Typography>
      </Layouts.Margin>
      <Divider both />
      <Typography variant="bodyLarge" fontWeight="bold">
        Apply to Orders
      </Typography>
      <Layouts.Margin top="2">
        <OverpaidOrderTable
          withRadioButtons
          currentCustomer={currentCustomer}
          selectedOrder={values.orderId}
          onOrderSelected={handleOrderSelected}
        />
      </Layouts.Margin>
      <Divider both />
      <Typography variant="bodyLarge" fontWeight="bold">
        Refund Payment Info
      </Typography>
      <ScrollableFormWrapper>
        <FormikProvider value={formik}>
          <Layouts.Margin top="1">
            <Layouts.Grid columnGap="4" columns="50% 30%">
              {refundablePayments.length > 1 ? (
                <Layouts.Cell width={2}>
                  <Select
                    nonClearable
                    label="Select original payment"
                    name="refundedPaymentId"
                    value={values.refundedPaymentId}
                    onSelectChange={handleRefundedPaymentChange}
                    options={refundedPaymentOptions}
                  />
                </Layouts.Cell>
              ) : null}
              <Calendar
                name="date"
                label="Date"
                withInput
                value={new Date()}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                onDateChange={noop}
                readOnly
              />
              <Select
                nonClearable
                label="Payment type*"
                name="paymentType"
                value={values.refundType}
                onSelectChange={handleRefundTypeChange}
                options={refundTypeOptions}
                error={errors.refundType}
              />
              <TextInput
                name="amount"
                type="number"
                label="Amount, $*"
                value={values.amount}
                onChange={handleChange}
                error={errors.amount}
              />
              {values.refundType === 'CHECK' ? (
                <FormInput
                  name="checkNumber"
                  label="Check #*"
                  value={values.checkNumber}
                  onChange={handleChange}
                  error={errors.checkNumber}
                />
              ) : null}
              {values.refundType === 'CREDIT_CARD' && selectedOrder?.creditCardId ? (
                <Select
                  nonClearable
                  label="Credit Card"
                  name="creditCardId"
                  value={selectedOrder?.creditCardId}
                  onSelectChange={noop}
                  options={creditCardOptions}
                  disabled
                />
              ) : null}
            </Layouts.Grid>
          </Layouts.Margin>
        </FormikProvider>
      </ScrollableFormWrapper>
      <ActionButtonContainer>
        <Button onClick={onRefundCanceled}>Cancel Refund</Button>
        <Button onClick={handleRefundCreate} variant="success" disabled={loading}>
          Refund Payment
        </Button>
      </ActionButtonContainer>
    </>
  );
};

export default observer(CreateRefund);
