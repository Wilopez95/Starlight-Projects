import React, { FC } from 'react';
import { gql } from '@apollo/client';
import { Trans, useTranslation } from '../../../i18n';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { Form, Field, FormSpy } from 'react-final-form';
import * as yup from 'yup';

import { TextField, validateSchema, SubmitError, ContentLoader } from '@starlightpro/common';
import ImageUpload from '../../../components/ImageUpload';

import { useGetCompanyBrandSettingsQuery } from '../../../graphql/api';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

gql`
  query getCompanyBrandSettings {
    company {
      id
      logoUrl
      companyName1
      companyName2
    }
  }
`;

const useStyles = makeStyles(({ spacing, palette }) => ({
  root: {
    position: 'relative',
  },
  paper: {
    marginBottom: spacing(3),
  },
  formWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: spacing(4),
    paddingBottom: spacing(2),
  },
  previewWrapper: {
    flex: 1,
    display: 'flex',
    marginLeft: 130,
    flexDirection: 'column',
  },
  preview: {
    height: 154,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: spacing(4),
    backgroundColor: palette.grey[800],
    margin: spacing(2, 0, 6.25),
    color: palette.common.white,
  },
  previewSubheader: {
    fontSize: 22,
    lineHeight: 1.17,
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
  },
  logo: {
    maxWidth: 77,
    maxHeight: 77,
  },
  logoPlaceholder: {
    width: 77,
    height: 77,
    borderRadius: '50%',
    border: `2px dashed ${palette.common.white}`,
  },
  namesWrapper: {
    display: 'grid',
    gridColumnGap: spacing(4),
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  actionsWrapper: {
    display: 'none',
    justifyContent: 'flex-end',
    padding: spacing(4),
  },
  companyNameLine1: {
    wordBreak: 'break-word',
  },
}));

const BrandSchema = yup.object({
  logoUrl: yup.string().nullable(),
  companyName1: yup.string().max(100).required('Required'),
  companyName2: yup.string().max(100).nullable(),
});

const BrandForm: FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: brandSettingsData, loading } = useGetCompanyBrandSettingsQuery({
    fetchPolicy: 'network-only',
  });
  const brandSettings = brandSettingsData?.company;

  return (
    <Paper elevation={0} className={classes.paper}>
      <Form
        onSubmit={() => {}}
        initialValues={brandSettings}
        validate={validateSchema(BrandSchema)}
        subscription={{}}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit} className={classes.root}>
            {loading && <ContentLoader expanded />}
            <SubmitError />
            <Box className={classes.formWrapper}>
              <Field name="logoUrl" subscription={{ value: true }}>
                {({ input }) => (
                  <ImageUpload
                    imageUrl={input.value}
                    pathEntries={['brandImage']}
                    onChange={() => {}}
                    onDelete={() => {}}
                  />
                )}
              </Field>

              <Box className={classes.previewWrapper}>
                <Typography variant="subtitle1">
                  <Trans>Preview</Trans>
                </Typography>

                <Box className={classes.preview}>
                  <Box mr={6}>
                    <Field name="logoUrl" subscription={{ value: true }}>
                      {({ input }) =>
                        input.value ? (
                          <img src={input.value} className={classes.logo} alt="Preview" />
                        ) : (
                          <Box className={classes.logoPlaceholder} />
                        )
                      }
                    </Field>
                  </Box>
                  <Box>
                    <Field name="companyName1" subscription={{ value: true }}>
                      {({ input }) => (
                        <Typography variant="h2" className={classes.companyNameLine1}>
                          {input.value}
                        </Typography>
                      )}
                    </Field>
                    <Field name="companyName2" subscription={{ value: true }}>
                      {({ input }) => (
                        <Typography component="div" className={classes.previewSubheader}>
                          {input.value}
                        </Typography>
                      )}
                    </Field>
                  </Box>
                </Box>

                <Box className={classes.namesWrapper}>
                  <TextField
                    disabled
                    fullWidth
                    name="companyName1"
                    label={t('Company Name Line 1')}
                    required
                  />
                  <TextField
                    disabled
                    fullWidth
                    name="companyName2"
                    label={t('Company Name Line 2')}
                  />
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
                    <Trans>Save Logo</Trans>
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

export default BrandForm;
