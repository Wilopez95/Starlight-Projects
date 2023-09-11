import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormSpy } from 'react-final-form';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export const SubmitError = () => {
  const [t] = useTranslation();

  return (
    <FormSpy subscription={{ submitError: true }}>
      {({ submitError }) =>
        (submitError && (
          <Box>
            <Typography color="error">{t(submitError)}</Typography>
            <br />
          </Box>
        )) ||
        null
      }
    </FormSpy>
  );
};
