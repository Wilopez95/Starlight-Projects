import React, { FC } from 'react';
import { Field } from 'react-final-form';
import { TextField, CheckBoxField } from '@starlightpro/common';
import { Trans } from '../../../i18n';
import * as yup from 'yup';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import AddressSearchField from '../../../components/FinalForm/AddressSearchField';

export const CustomerAddressesSchema = yup.object().shape({
  mailingAddress: yup.object({
    addressLine1: yup
      .string()
      .required('Line Address 1 is required')
      .max(200, 'Should be less than 200 characters'),
    addressLine2: yup.string().max(200, 'Should be less than 200 characters'),
    state: yup
      .string()
      .required('State is required')
      .max(100, 'Should be less then 100 characters'),
    city: yup.string().required('City is required').max(100, 'Should be less then 100 characters'),
    zip: yup.string().required('Zip Code is required').max(50, 'Should be less then 50 characters'),
  }),
  billingAddress: yup.object().when('billingSameAsMailing', {
    is: false,
    then: yup.object({
      addressLine1: yup
        .string()
        .required('Line Address 1 is required')
        .max(200, 'Should be less than 200 characters'),
      addressLine2: yup.string().max(200, 'Should be less than 200 characters'),
      state: yup
        .string()
        .required('State is required')
        .max(100, 'Should be less then 100 characters'),
      city: yup
        .string()
        .required('City is required')
        .max(100, 'Should be less then 100 characters'),
      zip: yup
        .string()
        .required('Zip Code is required')
        .max(50, 'Should be less then 50 characters'),
    }),
  }),
});

export interface CustomerAddressesFormProps {}

const useStyles = makeStyles((theme: Theme) => ({
  dividerMargin: {
    marginLeft: theme.spacing(3),
  },
  verticalMargin: {
    marginTop: theme.spacing(4),
  },
  mailingStateField: {
    flexGrow: 1,
  },
}));

export const CustomerAddressesForm: FC<CustomerAddressesFormProps> = () => {
  const classes = useStyles();

  return (
    <Box pt={3} display="flex" flexDirection="column">
      <Typography variant="subtitle2">
        <Trans>Mailing Address</Trans>
      </Typography>

      <div className={classes.verticalMargin} />

      <AddressSearchField
        label={<Trans>Search Address</Trans>}
        fullWidth
        name="mailingAddressSearch"
      />

      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%">
          <TextField
            fullWidth
            name="mailingAddress.addressLine1"
            label={<Trans>Address Line 1</Trans>}
            required
          />
          <TextField fullWidth name="mailingAddress.city" label={<Trans>City</Trans>} required />
        </Box>
        <div className={classes.dividerMargin} />
        <Box display="flex" flexDirection="row" flexWrap="wrap" width="50%">
          <TextField
            fullWidth
            name="mailingAddress.addressLine2"
            label={<Trans>Address Line 2</Trans>}
          />
          <TextField
            className={classes.mailingStateField}
            name="mailingAddress.state"
            label={<Trans>State</Trans>}
            required
          />
          <div className={classes.dividerMargin} />
          <TextField name="mailingAddress.zip" label={<Trans>ZIP</Trans>} required />
        </Box>
      </Box>

      <Typography variant="subtitle2">
        <Trans>Billing Address</Trans>
      </Typography>

      <CheckBoxField
        name="billingSameAsMailing"
        label={<Trans>Billing address same as mailing address</Trans>}
      />

      <Field name="billingSameAsMailing" subscription={{ value: true }}>
        {({ input }) =>
          !input.value && (
            <Box display="flex" flexDirection="column">
              <AddressSearchField
                label={<Trans>Search Address</Trans>}
                fullWidth
                name="billingAddressSearch"
              />
              <Box display="flex" flexDirection="row">
                <Box display="flex" flexDirection="column" width="50%">
                  <TextField
                    fullWidth
                    name="billingAddress.addressLine1"
                    label={<Trans>Address Line 1</Trans>}
                    required
                  />
                  <TextField fullWidth name="billingAddress.city" label={<Trans>City</Trans>} />
                </Box>
                <div className={classes.dividerMargin} />
                <Box display="flex" flexDirection="row" flexWrap="wrap" width="50%">
                  <TextField
                    fullWidth
                    name="billingAddress.addressLine2"
                    label={<Trans>Address Line 2</Trans>}
                  />
                  <TextField
                    fullWidth
                    name="billingAddress.state"
                    className={classes.mailingStateField}
                    label={<Trans>State</Trans>}
                    required
                  />
                  <div className={classes.dividerMargin} />
                  <TextField name="billingAddress.zip" label={<Trans>ZIP</Trans>} required />
                </Box>
              </Box>
            </Box>
          )
        }
      </Field>
    </Box>
  );
};
