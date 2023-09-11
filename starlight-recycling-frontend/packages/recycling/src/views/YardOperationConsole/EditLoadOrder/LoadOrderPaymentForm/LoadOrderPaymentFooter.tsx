import React, { FC, useCallback } from 'react';
import { useForm } from 'react-final-form';
import { Box, Divider, makeStyles } from '@material-ui/core';

import { OrderStatus } from '../../../../graphql/api';
import { BackButton } from '../../components/BackButton';
import { CompleteOrderButton } from '../../components/CompleteOrderButton';
import { SaveButton } from '../../components/SaveButton';
import { useScale } from '../../../../hooks/useScale';
import { setWeightOutFromScale } from '../../helpers/setWeightOutFromScale';

const useStyles = makeStyles(({ spacing }) => ({
  footer: {
    padding: spacing(0, 4, 3, 4),
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  rightActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
  leftActions: {
    '& > *': {
      marginRight: spacing(2),
    },
    '& > *:last-child': {
      marginRight: 0,
    },
  },
}));

export interface LoadOrderPaymentFooterProps {
  onChangeStep?: () => void;
  onBack?(): void;
}

export const LoadOrderPaymentFooter: FC<LoadOrderPaymentFooterProps> = ({
  onChangeStep,
  onBack,
}) => {
  const classes = useStyles();
  const form = useForm();
  const scale = useScale();

  const handleBackButton = useCallback(async () => {
    if (onChangeStep) {
      try {
        await onChangeStep();

        if (onBack) {
          onBack();
        }
      } catch {
        return;
      }

      form.reset();
      setWeightOutFromScale(form, scale, OrderStatus.Load);
    }
  }, [form, onBack, onChangeStep, scale]);

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <BackButton handleSubmit={handleBackButton} />
          <SaveButton />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <CompleteOrderButton />
        </Box>
      </Box>
    </Box>
  );
};
