import React, { FC } from 'react';
import { gql } from '@apollo/client';
import { omit } from 'lodash-es';
import { Trans, useTranslation } from '../../../i18n';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Form, FormSpy } from 'react-final-form';
import * as yup from 'yup';

import { TextField, validateSchema, SubmitError, ContentLoader } from '@starlightpro/common';

import { useGetCompanyInfoSettingsQuery } from '../../../graphql/api';
import { PHONE_REGEX } from '../../../constants/regex';

export const GET_COMPANY_Info_SETTINGS = gql`
  query getCompanyInfoSettings {
    company {
      facilityAddress
      facilityAddress2
      facilityCity
      facilityState
      facilityZip
      mailingAddress
      mailingAddress2
      mailingCity
      mailingState
      mailingZip
      website
      phone
      fax
      email
    }
  }
`;

const useStyles = makeStyles(({ spacing }) => ({
  root: {
    position: 'relative',
  },
  fieldsWrapper: {
    display: 'flex',
  },
  header: {
    padding: spacing(0, 4, 4, 4),
  },
  fieldsColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: spacing(0, 4),
  },
  fieldsPaired: {
    display: 'flex',
    justifyContent: 'space-between',

    '& > *:first-child': {
      marginRight: spacing(4),
    },
  },
  pairedInput: {
    '&:first-of-type': {
      marginRight: spacing(1),
    },
    '&:last-of-type': {
      marginLeft: spacing(1),
    },
  },
  subtitle: {
    marginBottom: spacing(4),
  },
  actionsWrapper: {
    display: 'none',
    justifyContent: 'flex-end',
    padding: spacing(4),
  },
}));

const CompanyInfoSchema = yup.object({
  facilityAddress: yup.string().max(200, 'Maximum 200 characters allowed').nullable(),
  facilityAddress2: yup.string().max(200, 'Maximum 200 characters allowed').nullable(),
  facilityCity: yup.string().max(100, 'Maximum 100 characters allowed').nullable(),
  facilityState: yup.string().max(100, 'Maximum 100 characters allowed').nullable(),
  facilityZip: yup.string().max(50, 'Maximum 50 characters allowed').nullable(),
  mailingAddress: yup.string().max(200, 'Maximum 200 characters allowed').required('Required'),
  mailingAddress2: yup.string().max(200, 'Maximum 200 characters allowed').nullable(),
  mailingCity: yup.string().max(100, 'Maximum 100 characters allowed').nullable(),
  mailingState: yup.string().max(100, 'Maximum 100 characters allowed').nullable(),
  mailingZip: yup.string().max(50, 'Maximum 50 characters allowed').nullable(),
  website: yup.string().max(200, 'Maximum 200 characters allowed').nullable(),
  phone: yup
    .string()
    .max(50, 'Maximum 50 characters allowed')
    .trim()
    .matches(PHONE_REGEX, 'Wrong format')
    .required('Required'),
  fax: yup
    .string()
    .max(50, 'Maximum 50 characters allowed')
    .trim()
    .matches(PHONE_REGEX, 'Wrong format')
    .nullable(),
  email: yup.string().email().max(200, 'Maximum 200 characters allowed').nullable(),
});

const CompanyInfoForm: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: infoSettingsData, loading } = useGetCompanyInfoSettingsQuery({
    fetchPolicy: 'network-only',
  });
  const infoSettings = infoSettingsData?.company;

  return (
    <Paper elevation={0}>
      <Form
        onSubmit={() => {}}
        initialValues={omit(infoSettings, '__typename')}
        validate={validateSchema(CompanyInfoSchema)}
        subscription={{}}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className={classes.root}>
            {loading && <ContentLoader expanded />}
            <Box paddingTop={4} paddingBottom={2}>
              <Typography variant="h5" className={classes.header}>
                <Trans>Company Info</Trans>
              </Typography>

              <SubmitError />
              <Box className={classes.fieldsWrapper}>
                <Box className={classes.fieldsColumn}>
                  <Typography className={classes.subtitle} variant="subtitle1">
                    <Trans>Processing Facility Address</Trans>
                  </Typography>

                  <TextField disabled name="facilityAddress" fullWidth label={t('Address 1')} />

                  <TextField disabled name="facilityAddress2" fullWidth label={t('Address 2')} />

                  <TextField disabled name="facilityCity" fullWidth label={t('City')} />

                  <Box className={classes.fieldsPaired}>
                    <TextField disabled name="facilityState" fullWidth label={t('State')} />

                    <TextField disabled name="facilityZip" fullWidth label={t('Zip')} />
                  </Box>
                </Box>

                <Box className={classes.fieldsColumn}>
                  <Typography className={classes.subtitle} variant="subtitle1">
                    <Trans>Mailing Address</Trans>
                  </Typography>

                  <TextField
                    disabled
                    name="mailingAddress"
                    fullWidth
                    label={t('Address 1')}
                    required
                  />

                  <TextField disabled name="mailingAddress2" fullWidth label={t('Address 2')} />

                  <TextField disabled name="mailingCity" fullWidth label={t('City')} />

                  <Box className={classes.fieldsPaired}>
                    <TextField disabled name="mailingState" fullWidth label={t('State')} />
                    <TextField disabled name="mailingZip" fullWidth label={t('Zip')} />
                  </Box>
                </Box>

                <Box className={classes.fieldsColumn}>
                  <Typography className={classes.subtitle} variant="subtitle1">
                    <Trans>Contact Details</Trans>
                  </Typography>

                  <TextField disabled name="phone" fullWidth label={t('Phone #')} required />

                  <TextField disabled name="fax" fullWidth label={t('Fax #')} />

                  <TextField disabled name="website" fullWidth label={t('Official Web Site')} />

                  <TextField disabled name="email" fullWidth label={t('Official Email')} />
                </Box>
              </Box>
            </Box>
            <Divider />
            <Box className={classes.actionsWrapper}>
              <FormSpy subscription={{ pristine: true, submitting: true, invalid: true }}>
                {({ pristine, submitting, invalid }) => (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={pristine || submitting || invalid}
                  >
                    <Trans>Save Info</Trans>
                  </Button>
                )}
              </FormSpy>
            </Box>
          </form>
        )}
      />
    </Paper>
  );
};

export default CompanyInfoForm;
