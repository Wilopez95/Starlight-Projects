import React, { memo, useState } from 'react';
import { CheckBoxField, SelectOption, TextField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import Box from '@material-ui/core/Box';
import { BillingCycle, PaymentTerm } from '../../../graphql/api';

export interface PaymentFieldsProps {
  classes: {
    dividerMargin: string;
    billingCycleField: string;
    paymentTermField: string;
  };
  onAccount: boolean;
}

const BillingCycleOptions = [
  BillingCycle.Daily,
  BillingCycle.Weekly,
  BillingCycle.TwentyEightDays,
  BillingCycle.Monthly,
  BillingCycle.Quaterly,
  BillingCycle.Yearly,
].map((cycle) => (
  <SelectOption key={cycle} value={cycle}>
    <Trans>{'BillingCycle-' + cycle}</Trans>
  </SelectOption>
));

const PaymentTermOptions = [
  PaymentTerm.Cod,
  PaymentTerm.Net_15Days,
  PaymentTerm.Net_30Days,
  PaymentTerm.Net_60Days,
].map((term) => (
  <SelectOption key={term} value={term}>
    <Trans>{'PaymentTerm-' + term}</Trans>
  </SelectOption>
));

export const PaymentFields = memo<PaymentFieldsProps>(({ classes, onAccount }) => {
  const [onAccCheck, setOnAccCheck] = useState(onAccount);

  return (
    <>
      <CheckBoxField
        name="onAccount"
        label={<Trans>On Account</Trans>}
        checked={onAccCheck}
        onChange={() =>
          setOnAccCheck((prevState) => {
            return !prevState;
          })
        }
      />
      <Box display="flex" mb={3}>
        <TextField
          type="number"
          name="creditLimit"
          inputProps={{ id: 'creditLimit' }}
          label={<Trans>Credit Limit</Trans>}
          required={onAccCheck}
          disabled={!onAccCheck}
          fullWidth
        />
        <div className={classes.dividerMargin} />
        <TextField
          name="billingCycle"
          id="billingCycle"
          label={<Trans>Billing Cycle</Trans>}
          className={classes.billingCycleField}
          required={onAccCheck}
          disabled={!onAccCheck}
          fullWidth
          select
        >
          {BillingCycleOptions}
        </TextField>
        <div className={classes.dividerMargin} />
        <TextField
          name="paymentTerm"
          id="paymentTerm"
          label={<Trans>Payment Terms</Trans>}
          className={classes.paymentTermField}
          required={onAccCheck}
          disabled={!onAccCheck}
          fullWidth
          select
        >
          {PaymentTermOptions}
        </TextField>
      </Box>
    </>
  );
});
