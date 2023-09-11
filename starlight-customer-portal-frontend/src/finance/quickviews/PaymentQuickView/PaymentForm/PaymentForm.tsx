import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, FormInput, Layouts, Typography } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Select } from '@root/core/common';
import { ISelectOption } from '@root/core/common/Select/types';
import { useStores } from '@root/core/hooks';
import { CreditCard } from '@root/customer/components';
import { formatCreditCard } from '@root/finance/helpers';
import { NewUnappliedPayment } from '@root/finance/types/entities';

import PaymentGrid from '../PaymentGrid/PaymentGrid';

const I18N_PATH = 'modules.finance.components.InvoicePaymentQuickView.';

const PaymentForm = () => {
  const { t } = useTranslation();
  const { values, handleChange, setFieldValue, errors } = useFormikContext<NewUnappliedPayment>();
  const { creditCardStore } = useStores();

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
  const activeCreditCards = useMemo(() => creditCardStore?.values?.filter(({ active }) => active), [
    creditCardStore.values,
  ]);
  const creditCardOptions = useMemo(
    () => [
      {
        label: t(`${I18N_PATH}NewCreditCard`),
        value: 0,
      },
      ...activeCreditCards?.map((creditCard) => ({
        label: formatCreditCard(creditCard),
        value: creditCard.id,
      })),
    ],
    [activeCreditCards, t],
  );

  useEffect(() => {
    setFieldValue(
      'amount',
      values.applications.reduce((acc, elem) => acc + elem.amount, 0),
    );
  }, [values.applications, setFieldValue]);

  return (
    <Layouts.Margin top='3'>
      <Layouts.Grid columnGap='4' columns='calc(50% - 16px) 30%'>
        <FormInput
          name='paymentType'
          label={t(`${I18N_PATH}PaymentType`)}
          value={startCase(values.paymentType)}
          disabled
          onChange={noop}
        />
        <Calendar
          name='date'
          label={t(`${I18N_PATH}Date`)}
          withInput
          value={values.date}
          onDateChange={noop}
          dateFormat=''
          readOnly
        />
        <Select
          nonClearable
          label={t(`${I18N_PATH}CreditCard`)}
          name='creditCardId'
          value={values.creditCardId}
          error={errors.creditCardId}
          onSelectChange={handleCreditCardChange}
          options={creditCardOptions as ISelectOption[]}
        />
        <FormInput
          name='amount'
          label={t(`${I18N_PATH}Amount`)}
          value={values.amount}
          onChange={handleChange}
          placeholder='0'
          error={errors.amount}
          disabled
        />
      </Layouts.Grid>
      {values.paymentType === 'creditCard' && values.creditCardId === 0 && (
        <>
          <Typography variant='bodyLarge' fontWeight='bold'>
            {t(`${I18N_PATH}CreditCardDetails`)}
          </Typography>
          <Layouts.Margin top='3' bottom='3'>
            <CreditCard activeByDefault borderless isNew basePath='newCreditCard' />
          </Layouts.Margin>
        </>
      )}
      <Typography fontWeight='bold' variant='headerThree'>
        {t(`${I18N_PATH}ApplyToInvoice`)}
      </Typography>
      <PaymentGrid />
    </Layouts.Margin>
  );
};

export default observer(PaymentForm);
