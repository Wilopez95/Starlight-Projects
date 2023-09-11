import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { FormInput, Typography } from '../../../../../../../common';
import { formatCreditCard, normalizeOptions } from '../../../../../../../helpers';
import { useDateIntl } from '../../../../../../../helpers/format/date';
import { useStores } from '../../../../../../../hooks';
import { CreditCard } from '../../../../../CreditCards/components';
import { type PaymentType } from '../../../../../Payments/types';
import { NewPayout } from '../../../../types';
import PaymentTable from '../PaymentTable/PaymentTable';

import { IPayoutForm } from './types';

const basePaymentTypeOptions = normalizeOptions(['creditCard', 'cash', 'check']);

const PayoutForm: React.FC<IPayoutForm> = ({ viewMode }) => {
  const { creditCardStore } = useStores();
  const { t } = useTranslation();
  const { values, setFieldValue, errors, handleChange } = useFormikContext<NewPayout>();
  const { firstDayOfWeek } = useIntl();

  const handlePaymentTypeChange = useCallback(
    (name: string, value: PaymentType) => {
      setFieldValue(name, value);
      if (value === 'creditCard') {
        setFieldValue('date', new Date());
      }

      // little hack because of discriminated union
      setFieldValue('newCreditCard', undefined);
    },
    [setFieldValue],
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
    <Layouts.Margin top="3">
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
          readOnly={viewMode || values.paymentType === 'creditCard'}
          maxDate={new Date()}
        />
        <Select
          nonClearable
          label="Payment type*"
          name="paymentType"
          value={values.paymentType}
          onSelectChange={handlePaymentTypeChange}
          options={basePaymentTypeOptions}
          error={errors.paymentType}
          disabled={viewMode}
        />
        <FormInput
          name="amount"
          label="Amount, $*"
          value={values.amount}
          onChange={noop}
          error={errors.amount}
          disabled
        />
        {values.paymentType === 'check' ? (
          <Layouts.Margin>
            <FormInput
              name="checkNumber"
              label="Check #*"
              value={values.checkNumber}
              onChange={handleChange}
              error={errors.checkNumber}
              disabled={viewMode}
            />
            <Checkbox name="isAch" value={values.isAch} onChange={handleChange} disabled={viewMode}>
              Is ACH
            </Checkbox>
          </Layouts.Margin>
        ) : null}
        {values.paymentType === 'creditCard' ? (
          <Select
            nonClearable
            label="Credit Card"
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
            Credit Card Details
          </Typography>
          <Layouts.Margin top="2">
            <CreditCard activeByDefault borderless isNew basePath="newCreditCard" />
          </Layouts.Margin>
        </>
      ) : null}

      <Typography fontWeight="bold" variant="headerThree">
        Select unapplied payment
      </Typography>
      <PaymentTable />
    </Layouts.Margin>
  );
};

export default observer(PayoutForm);
