import React, {
  FC,
  useState,
  // useEffect,
} from 'react';
// import { useParams } from 'react-router';
// import { get } from 'lodash-es';
import { Trans, useTranslation } from '../../../i18n';
import { Form } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
// import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import * as Yup from 'yup';

import RouterLink from '../../../components/RouterLink';
import {
  PASSWORD_REGEX,
  // PATHNAME_REGEX,
} from '../../../constants/regex';
import OutlinedTextField from '../../../components/FinalForm/OutlinedTextField';
import { validateFormValues } from '../../../utils/forms';
// import { useDoPasswordResetMutation, useCheckPasswordResetMutation } from '../../../graphql/api';

interface ResetFormProps {}

const useStyles = makeStyles((theme) => ({
  changePassHeading: {
    fontStyle: 'italic',
    marginBottom: theme.spacing(4),
  },
}));

const initialValues = {
  newPassword: '',
  confirmNewPassword: '',
};

const ResetSchema = Yup.object({
  newPassword: Yup.string()
    .matches(
      PASSWORD_REGEX,
      'Must include 8 characters with lowercase letters, uppercase letters, numbers, and symbols',
    )
    .required('Required'),
  confirmNewPassword: Yup.string().when('newPassword', (newPassword: string, schema: any) => {
    return schema.test({
      message: "The passwords don't match.",
      test: (confirmNewPassword: string) => confirmNewPassword === newPassword,
    });
  }),
});

interface FormError {
  message: string;
}

const ResetForm: FC<ResetFormProps> = () => {
  const classes = useStyles();
  // const { token }: any = useParams();
  const [t] = useTranslation();
  const [
    tokenCheckError,
    // setTokenCheckError,
  ] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  // const [doResetPassword] = useDoPasswordResetMutation();

  // const [checkPasswordToken, { called, loading }] = useCheckPasswordResetMutation();

  // useEffect(() => {
  //   if (!called && token) {
  //     checkPasswordToken({
  //       variables: {
  //         data: {
  //           token,
  //         },
  //       },
  //     }).catch((e) => {
  //       setTokenCheckError(get(e, 'graphQLErrors[0].message', e.message));
  //     });

  //     return;
  //   }
  // }, [called, checkPasswordToken, token, setTokenCheckError]);

  // if (!called || loading) {
  //   return <CircularProgress size={40} />;
  // }

  if (tokenCheckError) {
    return (
      <Box>
        <Typography color="error">{t(tokenCheckError)}</Typography>
        <br />
        <br />
        <Box display="flex" alignItems="flex-start">
          <RouterLink to="/reset-password">
            <Trans>Reset your password again</Trans>
          </RouterLink>
          &nbsp;
          <Trans>or</Trans>
          &nbsp;
          <RouterLink to="/login">
            <Trans>Log In</Trans>
          </RouterLink>
        </Box>
      </Box>
    );
  }

  return (
    <Form
      initialValues={initialValues}
      onSubmit={async () => {
        try {
          setFormErrors([]);
          // const result = await doResetPassword({
          //   variables: {
          //     data: {
          //       newPassword: values.newPassword,
          //       confirmNewPassword: values.confirmNewPassword,
          //       token,
          //     },
          //   },
          // });

          // if (result?.data?.resetPassword) {
          //   const basenameMatch = window.location.pathname.match(PATHNAME_REGEX);
          //   let basename = '';

          //   if (basenameMatch) {
          //     basename = basenameMatch[0];
          //   }
          //   const { protocol, host } = window.location;
          //   const loginUrl = `${protocol}//${host}${basename}/login`;

          //   window.location.href = `/logout?redirectTo=${encodeURIComponent(
          //     loginUrl,
          //   )}`;
          // }
        } catch (e) {
          if (e.graphQLErrors) {
            setFormErrors(e.graphQLErrors.map((e: any) => ({ message: e.message })));

            return;
          }

          setFormErrors([{ message: e.message }]);
        }
      }}
      validate={(values) => validateFormValues(values, ResetSchema)}
      render={({ handleSubmit, form, submitting, invalid, pristine, values }) => (
        <form onSubmit={handleSubmit} onChange={() => setFormErrors([])}>
          {formErrors && formErrors.length > 0 && (
            <Box>
              {formErrors.map((error) => (
                <Typography color="error">{t(error.message)}</Typography>
              ))}
              <br />
            </Box>
          )}
          <Typography className={classes.changePassHeading}>
            <Trans>new-password-requirements</Trans>
          </Typography>
          <OutlinedTextField
            name="newPassword"
            id="newPassword"
            required
            type="password"
            label={<Trans>New Password</Trans>}
            fullWidth
            InputProps={{
              endAdornment: !!values.newPassword && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="clear new password field"
                    onClick={() => {
                      form.change('newPassword', '');
                      setFormErrors([]);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <OutlinedTextField
            name="confirmNewPassword"
            id="confirmNewPassword"
            required
            label={<Trans>Retype New Password</Trans>}
            fullWidth
            type="password"
            InputProps={{
              endAdornment: !!values.confirmNewPassword && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="clear confirm new password field"
                    onClick={() => {
                      form.change('confirmNewPassword', '');
                      setFormErrors([]);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <RouterLink to="/login">
              <Trans>&#8592; Back to Log In</Trans>
            </RouterLink>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={pristine || submitting || invalid}
            >
              <Trans>Reset Password</Trans>
            </Button>
          </Box>
        </form>
      )}
    />
  );
};

export default ResetForm;
