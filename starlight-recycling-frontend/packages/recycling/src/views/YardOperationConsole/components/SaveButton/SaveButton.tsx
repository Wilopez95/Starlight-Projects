import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Button, ButtonProps } from '@material-ui/core';
import { useForm, useFormState } from 'react-final-form';
import { closeSidePanel } from '../../../../components/SidePanels';
import { isEmpty } from 'lodash/fp';
import { useUserIsAllowedToEditOrder } from '../../hooks/useUserIsAllowedToEditOrder';
import { useUserIsAllowedToEditNonServiceOrder } from '../../hooks/useUserIsAllowedToEditNonServiceOrder';
import { useScale } from '../../../../hooks/useScale';

export interface SaveButtonProps {
  variant?: ButtonProps['variant'];
  nonServiceOrder?: boolean;
  isWeightCapturing?: boolean;
}

export const SaveButton: FC<SaveButtonProps> = ({
  children,
  variant = 'outlined',
  nonServiceOrder,
  isWeightCapturing = false,
}) => {
  const { enableWeightCapturing, isManual } = useScale();
  const form = useForm();
  const isAllowedToEditOrder = useUserIsAllowedToEditOrder();
  const isAllowedToEditNonServiceOrder = useUserIsAllowedToEditNonServiceOrder();
  const {
    submitting,
    invalid,
    validating,
    submitSucceeded,
    submitFailed,
    dirtySinceLastSubmit,
    errors,
  } = useFormState({
    subscription: {
      values: true,
      errors: true,
      submitting: true,
      validating: true,
      invalid: true,
      submitSucceeded: true,
      submitFailed: true,
      dirtySinceLastSubmit: true,
    },
  });

  const disabled =
    (isWeightCapturing && !isManual && !enableWeightCapturing) ||
    (nonServiceOrder ? !isAllowedToEditNonServiceOrder : !isAllowedToEditOrder) ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  return (
    <Button
      type="submit"
      variant={variant}
      color="primary"
      onClick={async () => {
        await form.submit();
        closeSidePanel();
      }}
      disabled={disabled}
      key="on-submit"
    >
      {children || <Trans>Save</Trans>}
    </Button>
  );
};
