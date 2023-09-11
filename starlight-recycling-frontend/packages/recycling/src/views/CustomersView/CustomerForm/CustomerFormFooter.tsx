import React, { FC, ReactNode } from 'react';
import Button from '@material-ui/core/Button';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { FormSpy } from 'react-final-form';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';
import { Trans } from '../../../i18n';
import { makeStyles } from '@material-ui/core';

export interface CustomerFormFooterProps {
  onCancel(): void;
  cancelText?: ReactNode | string;
  submitText?: ReactNode | string;
  showBackIcon?: boolean;
  showSubmitIcon?: boolean;
}
const useStyles = makeStyles(({ palette }) => ({
  cancelText: {
    color: palette.primary.main,
  },
}));

export const CustomerFormFooter: FC<CustomerFormFooterProps> = ({
  onCancel,
  cancelText = <Trans>Back</Trans>,
  submitText = <Trans>Create New Customer</Trans>,
  showBackIcon,
  showSubmitIcon,
}) => {
  const classes = useStyles();

  return (
    <>
      <Button
        variant="outlined"
        onClick={onCancel}
        className={classes.cancelText}
        startIcon={showBackIcon && <KeyboardBackspaceIcon />}
      >
        {cancelText}
      </Button>
      <FormSpy
        subscription={{
          submitting: true,
          validating: true,
          invalid: true,
          hasSubmitErrors: true,
          dirtySinceLastSubmit: true,
        }}
      >
        {({ submitting, validating, invalid, hasSubmitErrors, dirtySinceLastSubmit }) => {
          return (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                submitting || validating || (hasSubmitErrors ? !dirtySinceLastSubmit : invalid)
              }
              endIcon={showSubmitIcon && <ArrowRightAltIcon />}
            >
              {submitText}
            </Button>
          );
        }}
      </FormSpy>
    </>
  );
};

export default CustomerFormFooter;
