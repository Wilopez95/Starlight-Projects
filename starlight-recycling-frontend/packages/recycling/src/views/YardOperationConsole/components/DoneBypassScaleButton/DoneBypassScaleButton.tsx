import React, { FC } from 'react';
import { isEmpty } from 'lodash/fp';
import { Trans } from '../../../../i18n';
import { useFormState } from 'react-final-form';
import { Button, darken, makeStyles } from '@material-ui/core';

import { DoneBypassScaleIcon } from './DoneBypassScaleIcon';
import { closeModal, openModal } from '../../../../components/Modals';
import { GradingNotificationModal } from '../DoneToScaleButton/GradingNotificationModal';
interface Props {
  handleSubmit: (props: any) => void;
  disabled?: boolean;
}

const useStyles = makeStyles(({ palette }) => ({
  doneBypassScaleButton: {
    backgroundColor: palette.orange,
    color: palette.common.white,
    '&:hover': {
      backgroundColor: darken(palette.orange, 0.1),
    },
  },
}));

export const DoneBypassScaleButton: FC<Props> = ({ handleSubmit, ...props }) => {
  const classes = useStyles();
  const { values } = useFormState({ subscription: { values: true } });
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
    props.disabled ||
    submitting ||
    validating ||
    (invalid && !isEmpty(errors)) ||
    ((submitSucceeded || submitFailed) && !dirtySinceLastSubmit);

  return (
    <Button
      variant="contained"
      color="secondary"
      className={classes.doneBypassScaleButton}
      type="submit"
      {...props}
      disabled={disabled}
      onClick={() => {
        const onSubmit = () => {
          handleSubmit(values);
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
      <DoneBypassScaleIcon />
      <Trans>Done Bypass Scale</Trans>
    </Button>
  );
};
