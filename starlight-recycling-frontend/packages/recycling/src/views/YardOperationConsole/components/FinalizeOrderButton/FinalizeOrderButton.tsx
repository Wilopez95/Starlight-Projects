import React, { FC, useEffect } from 'react';
import { isEmpty } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { Button } from '@material-ui/core';
import { useForm, useFormState } from 'react-final-form';

import { closeModal, openModal } from '../../../../components/Modals';
import { OrderStatus } from '../../../../graphql/api';
import { GradingNotificationModal } from '../DoneToScaleButton/GradingNotificationModal';
import { useUserIsAllowedToFinalizeOrder } from '../../hooks/useUserIsAllowedToFinalizeOrder';

export const FinalizeOrderButton: FC = () => {
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

  const isAllowedToFinalizeOrder = useUserIsAllowedToFinalizeOrder();

  const disabled =
    !isAllowedToFinalizeOrder ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  const handleSubmit = async () => {
    form.change('status', OrderStatus.Finalized);
    await form.submit();
  };

  useEffect(() => {
    //Test in QA
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: FinalizeOrderButton.tsx ~ errors', errors);
  }, [errors]);

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
      <Trans>Finalize Order</Trans>
    </Button>
  );
};
