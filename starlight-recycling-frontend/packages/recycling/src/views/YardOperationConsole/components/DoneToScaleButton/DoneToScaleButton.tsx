import React, { FC, useEffect } from 'react';
import { Trans } from '../../../../i18n';
import { Button } from '@material-ui/core';
import { useFormState } from 'react-final-form';

import { DoneToScaleIcon } from './DoneToScaleIcon';
import { closeModal, openModal } from '../../../../components/Modals';
import { GradingNotificationModal } from './GradingNotificationModal';
import { isEmpty } from 'lodash/fp';

interface Props {
  handleSubmit: () => void;
  disabled?: boolean;
}

export const DoneToScaleButton: FC<Props> = ({ handleSubmit, disabled }) => {
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

  const isDisabled =
    disabled ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  useEffect(() => {
    //Test in QA
    // eslint-disable-next-line no-console
    console.log('🚀 ~ file: DoneToScaleButton.tsx ~ errors', errors);
  }, [errors]);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isDisabled}
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
      <DoneToScaleIcon />
      <Trans>Done to Scale</Trans>
    </Button>
  );
};
