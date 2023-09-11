import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Button } from '@material-ui/core';
import { useFormState } from 'react-final-form';

interface Props {
  handleSubmit: () => void;
  disabled?: boolean;
}

export const BackButton: FC<Props> = ({ handleSubmit, disabled: disabledProp }) => {
  const { submitting, validating } = useFormState({
    subscription: {
      submitting: true,
      validating: true,
    },
  });

  const disabled = disabledProp || submitting || validating;

  return (
    <Button disabled={disabled} variant="outlined" onClick={handleSubmit}>
      <Trans>Back</Trans>
    </Button>
  );
};
