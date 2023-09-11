import React, { FC, useState } from 'react';
import { Trans } from '../../../i18n';
import { Form, Field } from 'react-final-form';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as Yup from 'yup';

import RouterLink from '../../../components/RouterLink';
// import getServiceAccountId from '../../../utils/getServiceAccountId';
import { validateFormValues } from '../../../utils/forms';
// import { useInitPasswordResetMutation } from '../../../graphql/api';

interface IResetFormProps {
  onSubmit: () => void;
}

const useStyles = makeStyles((theme) => ({
  changePassHeading: {
    fontWeight: 'bold',
    marginBottom: theme.spacing(4),
  },
}));

const initialValues = {
  email: '',
};

const ResetSchema = Yup.object({
  email: Yup.string().email('Email address is invalid').required('Required'),
});

interface FormError {
  message: string;
}

const ResetForm: FC<IResetFormProps> = () => {
  const classes = useStyles();
  const [errors, setFormErrors] = useState<FormError[]>([]);
  // const [initResetPassword] = useInitPasswordResetMutation();

  return (
    <Form
      initialValues={initialValues}
      onSubmit={async () => {
        try {
          setFormErrors([]);
          // const result = await initResetPassword({
          //   variables: {
          //     email: values.email,
          //     resource: getServiceAccountId(),
          //   },
          // });

          // if (result?.data?.initPasswordReset) {
          //   onSubmit();
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
          <Typography className={classes.changePassHeading}>
            <Trans>Change or reset your password</Trans>
          </Typography>
          {errors && errors.length > 0 && (
            <Box>
              {errors.map((error) => (
                <Typography color="error">{error.message}</Typography>
              ))}
              <br />
            </Box>
          )}
          <Field name="email">
            {({ input, meta }) => (
              <TextField
                {...input}
                type="email"
                disabled={submitting}
                fullWidth
                label={<Trans>Email</Trans>}
                variant="outlined"
                error={meta.touched && !!meta.error}
                helperText={meta.touched && meta.error && <Trans>{meta.error}</Trans>}
                InputProps={{
                  endAdornment:
                    (submitting && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )) ||
                    (!!values.email && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="clear email field"
                          onClick={() => {
                            form.change('email', '');
                            setFormErrors([]);
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    )),
                }}
              />
            )}
          </Field>

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
