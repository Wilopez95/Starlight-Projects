import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  Layouts,
  Select,
  TextInput,
} from '@starlightpro/shared-components';
import { FormikProvider, getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ActionCode } from '@root/helpers/notifications/types';

import { ApiError } from '../../../../../../../api/base/ApiError';
import { FormInput, Typography } from '../../../../../../../common';
import { Divider } from '../../../../../../../common/TableTools';
import {
  formatCreditCard,
  normalizeOptions,
  NotificationHelper,
} from '../../../../../../../helpers';
import { useDateIntl } from '../../../../../../../helpers/format/date';
import { useStores } from '../../../../../../../hooks';
import { useIntl } from '../../../../../../../i18n/useIntl';
import { CreditCard } from '../../../../../CreditCards/components';
import { PaymentService } from '../../../../../Payments/api/payment';
import { type PaymentType } from '../../../../../Payments/types';
import { ScrollableFormWrapper } from '../../styles';
import { ActionButtonContainer } from '../ActionButtonContainer/ActionButtonContainer';
import { OverlimitOrderTable } from '../OrderTables';

import { generateValidationSchema, getValues } from './formikData';
import { type ICreatePayment } from './types';

const paymentTypeOptions = normalizeOptions(['creditCard', 'cash', 'check']);

const CreatePayment: React.FC<ICreatePayment> = ({
  currentCustomer,
  onPaymentCanceled,
  onPaymentCreated,
}) => {
  const overlimitOrders = Object.values(currentCustomer.overlimitOrders);

  const totalOverlimit = overlimitOrders.reduce((acc, order) => acc + order.overlimitAmount, 0);

  const intl = useIntl();
  const { formatCurrency, firstDayOfWeek } = intl;
  const { t } = useTranslation();

  const { creditCardStore } = useStores();
  const formik = useFormik({
    validationSchema: generateValidationSchema(intl),
    validateOnChange: false,
    initialValues: getValues(currentCustomer),
    onSubmit: noop,
  });

  const { values, handleChange, setFieldValue, setValues, errors, validateForm } = formik;
  const { dateFormat } = useDateIntl();

  const currentAmount: number = overlimitOrders
    .filter(order => values.orderIds.includes(order.id))
    .reduce((acc, order) => acc + order.overlimitAmount, 0);

  useEffect(() => {
    creditCardStore.requestRelevant({ customerId: currentCustomer.id });
  }, [creditCardStore, currentCustomer.id]);

  const [loading, setLoading] = useState(false);

  const creditCardOptions = useMemo(
    () => [
      ...creditCardStore.values.map(creditCard => ({
        label: formatCreditCard(creditCard),
        value: creditCard.id,
      })),
      {
        label: 'New Credit Card',
        value: 0,
      },
    ],
    [creditCardStore.values],
  );

  const handlePaymentTypeChange = (_: string, value: PaymentType) => {
    if (value === 'check') {
      setValues({
        ...values,
        sendReceipt: false,
        paymentType: 'check',
        checkNumber: '',
        isAch: false,
      });
    } else {
      setValues({
        ...values,
        sendReceipt: false,
        paymentType: value,
        date: value === 'creditCard' ? new Date() : values.date,
      });
    }

    // little hack because of discriminated union
    setFieldValue('newCreditCard', undefined);
  };

  const handleCreditCardChange = useCallback(
    (name: string, value: number) => {
      setFieldValue(name, value);

      if (value === 0) {
        setFieldValue('newCreditCard.active', true);
      } else {
        setFieldValue('newCreditCard', undefined);
      }
    },
    [setFieldValue],
  );

  const handleAllOrdersCheck = useCallback(() => {
    const allOverlimitOrders = Object.values(currentCustomer.overlimitOrders);

    if (values.orderIds.length !== allOverlimitOrders.length) {
      setFieldValue('orderIds', [...allOverlimitOrders.map(({ id }) => id)]);
    } else {
      setFieldValue('orderIds', []);
    }
  }, [currentCustomer.overlimitOrders, values.orderIds.length, setFieldValue]);

  const handleOrderCheck = (orderId: number) => {
    const index = values.orderIds.indexOf(orderId);

    if (index !== -1) {
      setFieldValue(
        'orderIds',
        values.orderIds.filter(id => id !== orderId),
      );
    } else {
      setFieldValue('orderIds', [...values.orderIds, orderId]);
    }
  };

  const handlePaymentCreate = async () => {
    setLoading(true);

    const errorsData = await validateForm();
    if (!isEmpty(errorsData)) {
      setLoading(false);

      return;
    }

    try {
      await PaymentService.createMultiOrderPayment(currentCustomer.id, values);

      onPaymentCreated(values.orderIds);
      NotificationHelper.success('create', 'Payment');
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if (castedError?.response?.errors?.find(err => err?.extensions?.details === 412)) {
        NotificationHelper.error('createPayment', ActionCode.PRECONDITION_FAILED);
      } else {
        NotificationHelper.error('create', castedError?.response?.code as ActionCode, 'Payment');
      }
    }

    setLoading(false);
  };

  return (
    <>
      <Layouts.Flex justifyContent="space-between">
        <Typography>Credit Limit Exceeded</Typography>
        <Typography color="primary">{formatCurrency(totalOverlimit)}</Typography>
      </Layouts.Flex>
      <Layouts.Flex justifyContent="space-between">
        <Typography color="secondary">{overlimitOrders.length} Order(s)</Typography>
        <Typography color="secondary">Total overlimit</Typography>
      </Layouts.Flex>
      <Layouts.Margin top="1" bottom="1">
        <Typography color="secondary">
          Create a payment for individual orders. Be advised separate transactions will be created
          for each order, even if payment methods and card details are the same.
        </Typography>
      </Layouts.Margin>
      <Divider top bottom />

      <Typography variant="bodyLarge" fontWeight="bold">
        Payment Info
      </Typography>

      <ScrollableFormWrapper>
        <FormikProvider value={formik}>
          <Layouts.Margin top="1">
            <Layouts.Grid columnGap="4" columns="calc(50% - 16px) 30%">
              <Calendar
                name="date"
                label="Date*"
                withInput
                value={values.date}
                placeholder={t('Text.SetDate')}
                firstDayOfWeek={firstDayOfWeek}
                dateFormat={dateFormat}
                onDateChange={setFieldValue}
                error={errors.date}
                readOnly={values.paymentType === 'creditCard'}
                maxDate={new Date()}
              />
              <Select
                nonClearable
                label="Payment type*"
                name="paymentType"
                value={values.paymentType}
                onSelectChange={handlePaymentTypeChange}
                options={paymentTypeOptions}
                error={errors.paymentType}
              />
              <TextInput
                name="amount"
                label="Amount, $"
                value={currentAmount.toFixed(2)}
                disabled
                onChange={noop}
              />
              {values.paymentType === 'check' ? (
                <>
                  <FormInput
                    name="checkNumber"
                    label="Check #*"
                    value={values.checkNumber}
                    onChange={handleChange}
                    error={errors.checkNumber}
                  />
                  <Checkbox name="isAch" value={values.isAch} onChange={handleChange}>
                    Is ACH
                  </Checkbox>
                </>
              ) : null}
              {values.paymentType === 'creditCard' ? (
                <Select
                  nonClearable
                  label="Credit Card*"
                  name="creditCardId"
                  value={values.creditCardId}
                  onSelectChange={handleCreditCardChange}
                  options={creditCardOptions}
                  error={getIn(errors, 'creditCardId')}
                />
              ) : null}
            </Layouts.Grid>
          </Layouts.Margin>

          {values.paymentType === 'creditCard' && values.creditCardId === 0 ? (
            <>
              <Divider top bottom />

              <Typography variant="bodyLarge" fontWeight="bold">
                Credit Card Details
              </Typography>
              <Layouts.Margin top="1" bottom="1">
                <CreditCard activeByDefault borderless isNew basePath="newCreditCard" />
              </Layouts.Margin>
            </>
          ) : null}

          <Divider top bottom />

          <Typography variant="bodyLarge" fontWeight="bold">
            Apply to Orders
          </Typography>
          <Layouts.Margin top="2">
            <OverlimitOrderTable
              withCheckboxes
              currentCustomer={currentCustomer}
              selectedOrders={values.orderIds}
              onAllChecked={handleAllOrdersCheck}
              onOrderChecked={handleOrderCheck}
            />
          </Layouts.Margin>
        </FormikProvider>
      </ScrollableFormWrapper>
      <ActionButtonContainer>
        <Button onClick={onPaymentCanceled}>Cancel Payment</Button>
        <Button
          onClick={handlePaymentCreate}
          variant="success"
          disabled={values.orderIds.length === 0 || loading}
        >
          Create Payment
        </Button>
      </ActionButtonContainer>
    </>
  );
};

export default observer(CreatePayment);
