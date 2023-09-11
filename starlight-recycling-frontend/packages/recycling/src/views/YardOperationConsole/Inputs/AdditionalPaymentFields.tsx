import React, { FC } from 'react';

import { useField } from 'react-final-form';
import { Trans } from '../../../i18n';
import { TextField, CheckBoxField } from '@starlightpro/common';

import { Box, Grid } from '@material-ui/core';
import { PaymentMethodType } from '../../../graphql/api';
import { CustomerCreditCardInput } from './CustomerCreditCardInput';
import { NewCreditCardButton } from '../components/NewCreditCardButton';
import { ChangeInput } from './ChangeInput';
import { ReadOnlyOrderFormComponent } from '../types';
import { AmountInput } from './AmountInput';

export interface AdditionalPaymentFieldsProps extends ReadOnlyOrderFormComponent {}

export const AdditionalPaymentFields: FC<AdditionalPaymentFieldsProps> = ({ readOnly }) => {
  const {
    input: { value: paymentMethod },
  } = useField('paymentMethod', { subscription: { value: true } });

  if (paymentMethod === PaymentMethodType.OnAccount) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <AmountInput />
        </Grid>
      </Grid>
    );
  }

  if (paymentMethod === PaymentMethodType.Cash) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <AmountInput readOnly={readOnly} />
        </Grid>
        <Grid item xs={3}>
          <ChangeInput />
        </Grid>
      </Grid>
    );
  }

  if (paymentMethod === PaymentMethodType.Check) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <AmountInput />
        </Grid>
        <Grid item xs={6}>
          <TextField
            disabled={readOnly}
            name="checkNumber"
            label={<Trans>Check #</Trans>}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={3}>
          <Box mt="28px">
            <CheckBoxField disabled={readOnly} name="isAch" label={<Trans>is ACH</Trans>} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  if (paymentMethod === PaymentMethodType.CreditCard) {
    return (
      <Grid container spacing={1}>
        <Grid item xs={3}>
          <AmountInput />
        </Grid>
        <Grid item xs={6}>
          <CustomerCreditCardInput readOnly={readOnly} />
        </Grid>
        {!readOnly && (
          <Grid item xs={3}>
            <Box mt="28px">
              <NewCreditCardButton />
            </Box>
          </Grid>
        )}
      </Grid>
    );
  }

  return null;
};
