import React, { FC } from 'react';

import { Trans, useTranslation } from '../../../i18n';
import { TextField } from '@starlightpro/common';
import CommonTextField from '@starlightpro/common/components/TextField';
import { ReadOnlyOrderFormComponent } from '../types';
import { Field, useField } from 'react-final-form';
import { PaymentMethodType } from '../../../graphql/api';

export interface AmountInputProps extends ReadOnlyOrderFormComponent {}

export const AmountInput: FC<AmountInputProps> = ({ readOnly }) => {
  const {
    input: { value: paymentMethod },
  } = useField('paymentMethod', { subscription: { value: true } });
  const [, i18n] = useTranslation();

  const disabled = paymentMethod !== PaymentMethodType.Cash || readOnly;

  if (disabled) {
    return (
      <Field name="amount" subscription={{ value: true }}>
        {({ input: { value: amount } }) => (
          <CommonTextField
            label={<Trans>Amount, $t(currency)</Trans>}
            fullWidth
            value={amount.toLocaleString(i18n.language, { minimumFractionDigits: 2 })}
            disabled
          />
        )}
      </Field>
    );
  }

  return (
    <TextField
      type="number"
      name="amount"
      label={<Trans>Amount, $t(currency)</Trans>}
      fullWidth
      inputProps={{ min: 0 }}
    />
  );
};
