import React, { FC, useCallback } from 'react';
import { useField, useForm } from 'react-final-form';
import { Box, Divider, makeStyles } from '@material-ui/core';

import { OrderStatus } from '../../../../graphql/api';
import { BackButton } from '../../components/BackButton';
import { SaveButton } from '../../components/SaveButton';
import { ToPaymentButton } from '../../components/ToPaymentButton';
import { useUserIsAllowedToInYardOrder } from '../../hooks/useUserIsAllowedToInYardOrder';

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

interface Props {
  onBack?(): void;
  onChangeStep?(): void;
}

export const WeightOutOrderFooter: FC<Props> = ({ onBack, onChangeStep }) => {
  const classes = useStyles();
  const form = useForm();
  const isAllowedToInYardOrder = useUserIsAllowedToInYardOrder();

  const {
    input: { value: bypassScale },
  } = useField('bypassScale', { subscription: { value: true } });

  const handleSubmit = useCallback(async () => {
    if (onChangeStep) {
      try {
        await onChangeStep();
      } catch {
        return;
      }
    }

    form.reset();
    form.change('status', OrderStatus.InYard);

    if (onBack) {
      onBack();
    }
  }, [form, onBack, onChangeStep]);

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <BackButton disabled={!isAllowedToInYardOrder} handleSubmit={handleSubmit} />
          <SaveButton isWeightCapturing={!bypassScale} />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <ToPaymentButton isWeightCapturing={!bypassScale} />
        </Box>
      </Box>
    </Box>
  );
};
