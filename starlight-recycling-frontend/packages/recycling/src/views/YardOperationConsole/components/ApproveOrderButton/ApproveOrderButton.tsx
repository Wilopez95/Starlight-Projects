import React, { FC } from 'react';
import { isEmpty } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { Button } from '@material-ui/core';
import { useForm, useFormState } from 'react-final-form';

import { closeModal, openModal } from '../../../../components/Modals';
import { OrderStatus } from '../../../../graphql/api';
import { GradingNotificationModal } from '../DoneToScaleButton/GradingNotificationModal';
import { useUserIsAllowedToApproveOrder } from '../../hooks/useUserIsAllowedToApproveOrder';

export const ApproveOrderButton: FC = () => {
  const form = useForm();
  const {
    values,
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
  const isAllowedToApproveOrder = useUserIsAllowedToApproveOrder();

  const disabled =
    !isAllowedToApproveOrder ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  const handleSubmit = async () => {
    form.change('status', OrderStatus.Approved);
    await form.submit();
  };

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={disabled}
      onClick={() => {
        const onSubmit = () => {
          handleSubmit();
          closeModal();
        };

        if (values.gradingNotification && values.materialsDistributionTotal !== 100) {
          openModal({
            content: <GradingNotificationModal handleSubmit={onSubmit} />,
          });
        } else {
          onSubmit();
        }
      }}
    >
      <Trans>Approve Order</Trans>
    </Button>
  );
};
