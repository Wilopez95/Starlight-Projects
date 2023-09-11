import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput, Typography } from '../../../../../../../common';
import { BillableItemType } from '../../../../../../../consts';
import { formatCreditCard, normalizeOptions } from '../../../../../../../helpers';
import { useDateIntl } from '../../../../../../../helpers/format/date';
import { useBusinessContext, usePermission, useStores } from '../../../../../../../hooks';
import { useIntl } from '../../../../../../../i18n/useIntl';
import { CreditCard } from '../../../../../CreditCards/components';
import { type NewUnappliedPayment, type PaymentType } from '../../../../types';
import InvoiceTable from '../InvoiceTable/InvoiceTable';

import { IPaymentForm } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'quickViews.Payment.components.PaymentForm.';

const PaymentForm: React.FC<IPaymentForm> = ({ viewMode, isMemo, isWriteOff }) => {
  const {
    creditCardStore,
    paymentStore,
    billableServiceStore,
    lineItemStore,
    thresholdStore,
    businessUnitStore,
  } = useStores();
  // TODO: NewUnappliedPayment type is not appropriate here because this form is also used for REFUND_ON_ACCOUNT
  const { values, handleChange, setFieldValue, setValues, errors } =
    useFormikContext<NewUnappliedPayment>();

  const { businessUnitId } = useBusinessContext();
  const { currencySymbol, firstDayOfWeek } = useIntl();
  const { t } = useTranslation();

  // REFUND_ON_ACCOUNT payments can not be created manually
  const basePaymentTypeOptions = useMemo(
    () =>
      normalizeOptions([
        { value: 'creditCard', label: t(`${I18N_PATH}CreditCard`) },
        { value: 'cash', label: t(`${I18N_PATH}Cash`) },
        { value: 'check', label: t(`${I18N_PATH}CheckType`) },
      ]),
    [t],
  );

  const businessLineIds = useMemo(() => {
    const currentBusinessUnit = businessUnitStore.sortedValues.find(
      ({ id }) => id === Number(businessUnitId),
    );

    return currentBusinessUnit?.businessLines.map(({ id }) => id);
  }, [businessUnitId, businessUnitStore.sortedValues]);

  useEffect(() => {
    if (isMemo) {
      billableServiceStore.cleanup();
      lineItemStore.cleanup();
      thresholdStore.cleanup();
      billableServiceStore.request({ businessLineIds });
      lineItemStore.request({ businessLineIds });
      thresholdStore.request({ businessLineIds });
    }
  }, [billableServiceStore, lineItemStore, thresholdStore, isMemo, businessLineIds]);

  const creditCardOptions = useMemo(
    () => [
      {
        label: t(`${I18N_PATH}NewCreditCard`),
        value: 0,
      },
      ...creditCardStore.values
        .filter(creditCard => !creditCard.expiredLabel)
        .map(creditCard => ({
          label: formatCreditCard(creditCard),
          value: creditCard.id,
        })),
    ],
    [creditCardStore.values, t],
  );

  const paymentTypeOptions: ISelectOption[] = useMemo(
    () => [
      ...basePaymentTypeOptions,
      ...(viewMode ? [{ label: t(`${I18N_PATH}RefundOnAccount`), value: 'refundOnAccount' }] : []),
      ...(isMemo
        ? [
            {
              value: 'creditMemo',
              label: t(`${I18N_PATH}CreditMemo`),
            },
          ]
        : []),
      ...(isWriteOff
        ? [
            {
              value: 'writeOff',
              label: t(`${I18N_PATH}WriteOff`),
            },
          ]
        : []),
    ],
    [viewMode, isMemo, isWriteOff, t, basePaymentTypeOptions],
  );

  const billableItemOptions = useMemo(() => {
    const services = billableServiceStore.sortedValues.map(({ id, description }) => ({
      label: description,
      value: `${BillableItemType.service}_${id}`,
    }));
    const lineItems = lineItemStore.sortedValues.map(({ id, description }) => ({
      label: description,
      value: `${BillableItemType.lineItem}_${id}`,
    }));
    const thresholds = thresholdStore.sortedValues.map(({ id, description }) => ({
      label: description,
      value: `${BillableItemType.threshold}_${id}`,
    }));

    return [
      { options: services, label: t(`${I18N_PATH}Services`) },
      { options: lineItems, label: t(`${I18N_PATH}LineItems`) },
      { options: thresholds, label: t(`${I18N_PATH}Thresholds`) },
    ];
  }, [
    billableServiceStore.sortedValues,
    lineItemStore.sortedValues,
    t,
    thresholdStore.sortedValues,
  ]);

  const handlePaymentTypeChange = (_: string, value: Exclude<PaymentType, 'refundOnAccount'>) => {
    const newValues: NewUnappliedPayment = {
      ...values,
      sendReceipt: false,
      memoNote: '',
    };

    if (value === 'check') {
      setValues({
        ...newValues,
        paymentType: 'check',
        checkNumber: '',
        isAch: false,
      });
    } else {
      setValues({
        ...newValues,
        paymentType: value,
        date: value === 'creditCard' ? new Date() : values.date,
      });
    }

    // little hack because of discriminated union
    setFieldValue('newCreditCard', undefined);
  };

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      const newUnappliedAmount = +value || 0;

      const { prevBalance = 0 } = values;

      setValues({
        ...values,
        notAppliedInvoices: values.notAppliedInvoices?.map(invoice => ({
          ...invoice,
          checked: false,
          amount: undefined,
        })),
        unappliedAmount: newUnappliedAmount,
        newBalance: prevBalance - newUnappliedAmount,
      });
      handleChange(e);
    },
    [handleChange, setValues, values],
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

  const handleBillableItemChange = useCallback(
    (_, value: string) => {
      const billableItemInfo = value.split('_');

      setValues({
        ...values,
        billableItem: value,
        billableItemId: Number(billableItemInfo[1]),
        billableItemType: billableItemInfo[0] as BillableItemType,
      });
    },
    [setValues, values],
  );

  const canUpdateCreditMemos = usePermission('billing/payments:credit-memo:perform');
  const { dateFormat } = useDateIntl();

  return (
    <Layouts.Margin top="3">
      <Layouts.Grid columnGap="4" columns="calc(50% - 16px) 30%">
        <Select
          nonClearable
          label={`${t(`${I18N_PATH}PaymentType`)}*`}
          name="paymentType"
          value={values.paymentType}
          onSelectChange={handlePaymentTypeChange}
          options={paymentTypeOptions}
          error={errors.paymentType}
          disabled={viewMode || isMemo || isWriteOff}
        />
        <Calendar
          name="date"
          label={`${t(`${I18N_PATH}Date`)}*`}
          withInput
          value={values.date}
          onDateChange={setFieldValue}
          placeholder={t('Text.SetDate')}
          firstDayOfWeek={firstDayOfWeek}
          dateFormat={dateFormat}
          error={errors.date}
          readOnly={
            isWriteOff ||
            values.paymentType === 'creditCard' ||
            (viewMode && !isMemo && !canUpdateCreditMemos)
          }
          maxDate={new Date()}
        />
        {isMemo ? (
          <Select
            nonClearable
            label={t(`${I18N_PATH}BillableItemReference`)}
            name="billableItem"
            value={values.billableItem}
            onSelectChange={handleBillableItemChange}
            disabled={!canUpdateCreditMemos}
            options={billableItemOptions}
            error={errors.billableItem}
          />
        ) : null}
        <FormInput
          name="amount"
          type="number"
          label={`${t(`${I18N_PATH}Amount`, { currencySymbol })}*`}
          value={values.amount}
          onChange={handleAmountChange}
          className={styles.amount}
          error={errors.amount}
          disabled={
            isWriteOff ||
            (isMemo && canUpdateCreditMemos ? values.invoicedStatus !== 'unapplied' : viewMode)
          }
          placeholder="0"
        />
        {values.paymentType === 'check' ? (
          <>
            <FormInput
              name="checkNumber"
              label={`${t(`${I18N_PATH}Check`)}*`}
              value={values.checkNumber}
              onChange={handleChange}
              error={errors.checkNumber}
              disabled={viewMode}
            />
            <Checkbox name="isAch" value={values.isAch} onChange={handleChange} disabled={viewMode}>
              {t(`${I18N_PATH}IsACH`)}
            </Checkbox>
          </>
        ) : null}
        {values.paymentType === 'creditCard' ? (
          <Select
            nonClearable
            label={t(`${I18N_PATH}CreditCard`)}
            name="creditCardId"
            value={values.creditCardId}
            onSelectChange={handleCreditCardChange}
            options={creditCardOptions}
            error={getIn(errors, 'creditCardId')}
            disabled={viewMode}
          />
        ) : null}
      </Layouts.Grid>
      {values.paymentType === 'creditCard' && values.creditCardId === 0 ? (
        <>
          <Typography variant="bodyLarge" fontWeight="bold">
            {t(`${I18N_PATH}CreditCardDetails`)}
          </Typography>
          <Layouts.Margin top="3">
            <CreditCard activeByDefault borderless isNew basePath="newCreditCard" />
          </Layouts.Margin>
        </>
      ) : null}
      {isWriteOff ? (
        <FormInput
          name="writeOffNote"
          label={`${t(`${I18N_PATH}WriteOffNote`)}*`}
          area
          value={values.writeOffNote}
          onChange={handleChange}
          error={errors.writeOffNote}
          disabled={!paymentStore.writeOffCreating}
        />
      ) : null}
      <Typography fontWeight="bold" variant="headerThree">
        {t(`${I18N_PATH}ApplyToInvoice`)}
      </Typography>
      <Layouts.Margin top="3">
        <InvoiceTable isWriteOff={isWriteOff} />
      </Layouts.Margin>
    </Layouts.Margin>
  );
};

export default observer(PaymentForm);
