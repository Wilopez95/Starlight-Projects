import React, { FC } from 'react';
import { Trans } from '../../../../i18n';
import { Button } from '@material-ui/core';
import { useForm, useFormState } from 'react-final-form';

import { CustomerType, OrderStatus } from '../../../../graphql/api';
import { isEmpty } from 'lodash/fp';
import { useUserIsAllowedToCompleteOrder } from '../../hooks/useUserIsAllowedToCompleteOrder';

export const CompleteOrderButton: FC = () => {
  const form = useForm();
  const {
    submitting,
    invalid,
    validating,
    submitSucceeded,
    submitFailed,
    dirtySinceLastSubmit,
    errors,
    values,
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
  const isAllowedToCompletedOrder = useUserIsAllowedToCompleteOrder();

  const disabled =
    !isAllowedToCompletedOrder ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  return (
    <Button
      variant="contained"
      color="primary"
      disabled={disabled}
      onClick={() => {
        if (values.customer?.type === CustomerType.Walkup) {
          form.change('status', OrderStatus.Finalized);
        } else {
          form.change('status', OrderStatus.Completed);
        }

        form.submit();
      }}
      type="submit"
    >
      <Trans>Complete Order</Trans>
    </Button>
  );
};
