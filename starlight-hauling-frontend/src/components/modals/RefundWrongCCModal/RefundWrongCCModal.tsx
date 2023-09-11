import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { getIn, useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Modal, Typography, useQuickViewContext } from '@root/common';
import { Divider } from '@root/common/TableTools';
import FormContainer from '@root/components/FormContainer/FormContainer';
import { formatCreditCard, normalizeOptions } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CreditCard } from '@root/modules/billing/CreditCards/components';
import { sanitizeCreditCard } from '@root/modules/billing/CreditCards/store/sanitize';
import { Payment } from '@root/modules/billing/entities';
import {
  CreditCardPayment,
  INewCreditCard,
  NewPayment,
  PaymentType,
} from '@root/modules/billing/types';

import { generateValidationSchema, initialValues } from './formikData';
import { IRefundWrongCCModal } from './types';

import styles from './css/styles.scss';

const paymentTypeOptions = normalizeOptions(['creditCard', 'cash', 'check']);

const RefundWrongCCModal: React.FC<IRefundWrongCCModal> = ({
  onClose,
  creditCardLabel,
  amount,
  orderId,
  customerId,
  paymentId,
  ...modalProps
}) => {
  const { creditCardStore, orderStore, paymentStore } = useStores();
  const [originalPayment, setOriginalPayment] = useState<Payment | null>(null);
  const { businessUnitId } = useBusinessContext();
  const intl = useIntl();
  const { formatCurrency, formatDateTime, firstDayOfWeek } = intl;
  const { t } = useTranslation();
  const { forceCloseQuickView } = useQuickViewContext();

  useEffect(() => {
    const query = async () => {
      const response = await paymentStore.getLatestOrderPayment(orderId);

      setOriginalPayment(response);
    };

    query();
  }, [orderId, paymentStore]);

  const newValues: NewPayment = useMemo(() => {
    return {
      ...initialValues,
      amount,
    };
  }, [amount]);

  const handleSubmit = useCallback(
    async (paymentValues: NewPayment) => {
      const values = paymentValues as CreditCardPayment;

      await orderStore.refundWrongCreditCard(orderId, {
        ...values,
        businessUnitId,
        refundedPaymentId: paymentId,
        creditCardId: values.creditCardId === 0 ? undefined : values.creditCardId,
        newCreditCard:
          values.creditCardId === 0 && values.newCreditCard
            ? ({
                ...sanitizeCreditCard(values.newCreditCard),
                customerId,
              } as INewCreditCard)
            : undefined,
      });

      onClose?.();
      forceCloseQuickView();
    },
    [businessUnitId, customerId, forceCloseQuickView, onClose, orderId, orderStore, paymentId],
  );

  const formik = useFormik<NewPayment>({
    initialValues: newValues,
    validationSchema: generateValidationSchema(intl),
    onSubmit: handleSubmit,
    enableReinitialize: true,
    validateOnChange: false,
  });
  const { values, setFieldValue, errors, setValues, handleChange, setErrors } = formik;

  const handlePaymentTypeChange = useCallback(
    (_: string, value: PaymentType) => {
      if (value === 'check') {
        setValues({
          ...values,
          paymentType: 'check',
          checkNumber: '',
          isAch: false,
        });
      } else {
        setValues({
          ...values,
          paymentType: value,
        });
      }

      // little hack because of discriminated union
      setFieldValue('newCreditCard', undefined);
      setErrors({});
    },
    [setErrors, setFieldValue, setValues, values],
  );

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

  const creditCardOptions: ISelectOption[] = creditCardStore.values.map(creditCard => ({
    label: formatCreditCard(creditCard),
    value: creditCard.id,
  }));

  creditCardOptions.unshift({
    label: 'New Credit Card',
    value: 0,
  });

  const { dateFormat } = useDateIntl();

  return (
    <Modal onClose={onClose} {...modalProps} className={styles.modal}>
      <Layouts.Box maxHeight="750px" width="750px">
        <FormContainer formik={formik} fullHeight>
          <Layouts.Flex direction="column" justifyContent="space-between">
            <Layouts.Padding right="5" left="5" top="3">
              <Layouts.Padding>
                <Typography variant="headerThree">Refund Wrong Credit Card</Typography>
              </Layouts.Padding>
              <Layouts.Padding top="3">
                <Typography variant="headerFour">Refund Details</Typography>
              </Layouts.Padding>
              <Layouts.Padding top="2">
                <Layouts.Flex justifyContent="space-between">
                  <Typography color="secondary" variant="bodyMedium">
                    Original Payment:
                  </Typography>
                  <Typography variant="bodyMedium">{creditCardLabel}</Typography>
                </Layouts.Flex>
              </Layouts.Padding>
              <Layouts.Padding top="2">
                <Layouts.Flex justifyContent="space-between">
                  <Typography color="secondary" variant="bodyMedium">
                    Payment Date:
                  </Typography>
                  <Typography variant="bodyMedium">
                    {formatDateTime(originalPayment?.date ?? new Date()).date}
                  </Typography>
                </Layouts.Flex>
              </Layouts.Padding>
              <Layouts.Padding top="2">
                <Layouts.Flex justifyContent="space-between">
                  <Typography color="secondary" variant="bodyMedium" fontWeight="bold">
                    Payment Amount:
                  </Typography>
                  <Typography variant="bodyMedium">{formatCurrency(amount)}</Typography>
                </Layouts.Flex>
              </Layouts.Padding>
              <Divider top />
              <Layouts.Scroll maxHeight={240}>
                <Layouts.Padding top="3">
                  <Typography variant="headerFour">New Payment Details</Typography>
                </Layouts.Padding>
                <Layouts.Grid columnGap="4" columns="repeat(2 , calc(50% - 16px))">
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
                    readOnly
                  />
                  <FormInput
                    name="amount"
                    type="number"
                    label="Amount, $*"
                    value={amount}
                    onChange={noop}
                    disabled
                    error={getIn(errors, 'amount')}
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
                {values.paymentType === 'creditCard' && values.creditCardId === 0 ? (
                  <>
                    <Typography variant="bodyLarge" fontWeight="bold">
                      Credit Card Details
                    </Typography>
                    <Layouts.Margin top="3">
                      <CreditCard activeByDefault borderless isNew basePath="newCreditCard" />
                    </Layouts.Margin>
                  </>
                ) : null}
              </Layouts.Scroll>
            </Layouts.Padding>
            <Divider />
            <Layouts.Padding padding="4" left="5" right="5">
              <Layouts.Flex justifyContent="space-between">
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary">
                  Refund and change CC
                </Button>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>
        </FormContainer>
      </Layouts.Box>
    </Modal>
  );
};

export default observer(RefundWrongCCModal);
