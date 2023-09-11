import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { TextField, SelectOption, CheckBoxField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import * as yup from 'yup';
import { isNil } from 'lodash-es';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';

import { AprType, InvoiceConstruction, BillingCycle, PaymentTerm } from '../../../graphql/api';
import { PaymentFields } from './PaymentFields';
import { FinancialChargesFields } from './FinancialChargesFields';
import { DECIMAL_PRECISION } from '../../../constants/regex';

export const PaymentsAndBillingSchema = yup.object().shape({
  onAccount: yup.boolean(),
  creditLimit: yup.number().when('onAccount', {
    is: true,
    then: yup.number().min(0.1, 'Must be positive').required('Required'),
  }),
  billingCycle: yup
    .string()
    .nullable()
    .when('onAccount', {
      is: true,
      then: yup
        .string()
        .oneOf(
          [
            BillingCycle.Daily,
            BillingCycle.Monthly,
            BillingCycle.Weekly,
            BillingCycle.Quaterly,
            BillingCycle.Yearly,
            BillingCycle.TwentyEightDays,
          ],
          'Required',
        ),
    }),
  paymentTerm: yup
    .string()
    .nullable()
    .when('onAccount', {
      is: true,
      then: yup
        .string()
        .oneOf(
          [PaymentTerm.Cod, PaymentTerm.Net_15Days, PaymentTerm.Net_30Days, PaymentTerm.Net_60Days],
          'Required',
        ),
    }),

  addFinancialCharges: yup.boolean(),
  apr: yup.string().when('addFinancialCharges', {
    is: true,
    then: yup.string().required('Required'),
  }),
  aprCharge: yup.number().when(['addFinancialCharges', 'apr'], {
    is: (addFinancialCharges, aprType) => addFinancialCharges && aprType === AprType.Custom,
    then: yup
      .number()
      .max(9999999999.99, 'Max value is 9999999999.99')
      .test('is-decimal', 'Max 2 numbers after decimal', (value) =>
        value ? DECIMAL_PRECISION.test(`${value}`) : true,
      )
      .required('Required'),
  }),

  sameAsMainContact: yup.boolean(),

  emailForInvoices: yup.string().when('sendInvoiceByEmail', {
    is: true,
    then: yup
      .string()
      .nullable()
      .email('Invalid')
      .when('sameAsMainContact', {
        is: (v) => isNil(v) || v === false,
        then: yup.string().required('Required'),
        otherwise: yup.string().when('contactEmail', {
          is: isNil,
          then: yup.string().required('Main contact email is empty'),
          otherwise: yup.string().nullable(),
        }),
      }),
    otherwise: yup.string().nullable(),
  }),
});

const useStyles = makeStyles((theme: Theme) => ({
  dividerMargin: {
    marginLeft: theme.spacing(3),
  },
  billingCycleField: {
    minWidth: 140,
  },
  paymentTermField: {
    minWidth: 170,
  },
  aprTypeField: {
    minWidth: 170,
  },
  invoiceConstructionField: {
    minWidth: 170,
  },
  taxInfo: {
    minWidth: 170,
    marginBottom: theme.spacing(2),
  },
}));

export interface PaymentsAndBillingFormProps {}

const InvoiceConstructionOptions = [
  InvoiceConstruction.ByAddress,
  InvoiceConstruction.ByCustomer,
  InvoiceConstruction.ByOrder,
].map((type) => (
  <SelectOption key={type} value={type}>
    <Trans>{'InvoiceConstruction-' + type}</Trans>
  </SelectOption>
));

export const PaymentsAndBillingForm: FC<PaymentsAndBillingFormProps> = () => {
  const classes = useStyles();

  return (
    <Box pt={3} display="flex" flexDirection="column">
      <Typography variant="subtitle2">
        <Trans>Invoice</Trans>
      </Typography>
      <Box display="flex" mb={3}>
        <Box flex={1}>
          <TextField
            fullWidth
            name="invoiceConstruction"
            id="invoiceConstruction"
            label={<Trans>Invoice Construction</Trans>}
            className={classes.invoiceConstructionField}
            select
          >
            {InvoiceConstructionOptions}
          </TextField>
          <Field name="sendInvoiceByEmail" subscription={{ value: true }}>
            {({ input: { value: sendInvoiceByEmail } }) => (
              <>
                <Field name="sameAsMainContact" subscription={{ value: true }}>
                  {({ input: { value: sameAsMainContact } }) => (
                    <Field name="mainContact.email" subscription={{ value: true }}>
                      {({ input: { value: contactEmail } }) => (
                        <TextField
                          type="email"
                          name="emailForInvoices"
                          inputProps={{ id: 'emailForInvoices' }}
                          label={<Trans>Email for invoices</Trans>}
                          required={sendInvoiceByEmail}
                          disabled={!sendInvoiceByEmail || (contactEmail && sameAsMainContact)}
                          fullWidth
                        />
                      )}
                    </Field>
                  )}
                </Field>
                <CheckBoxField
                  disabled={!sendInvoiceByEmail}
                  name="sameAsMainContact"
                  label={<Trans>Same as Main Contact Email</Trans>}
                />
              </>
            )}
          </Field>
        </Box>
        <div className={classes.dividerMargin} />
        <Box flex={1} display="flex" flexDirection="column">
          <Typography variant="body2" color="textSecondary">
            <Trans>Send Invoice by</Trans>
          </Typography>
          <Box>
            <CheckBoxField name="sendInvoiceByEmail" label={<Trans>Email</Trans>} />
            <CheckBoxField name="sendInvoiceByPost" label={<Trans>Post Mail</Trans>} />
          </Box>
        </Box>
      </Box>

      <Typography variant="subtitle2">
        <Trans>Payment</Trans>
      </Typography>

      <Field name="onAccount" subscription={{ value: true }}>
        {({ input }) => <PaymentFields onAccount={input.value} classes={classes} />}
      </Field>

      <Field name="addFinancialCharges" subscription={{ value: true }}>
        {({ input }) => (
          <FinancialChargesFields addFinancialCharges={input.value} classes={classes} />
        )}
      </Field>
    </Box>
  );
};
