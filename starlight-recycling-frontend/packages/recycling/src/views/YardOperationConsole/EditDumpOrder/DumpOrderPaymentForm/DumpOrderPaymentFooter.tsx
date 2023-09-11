import React, { FC, useCallback } from 'react';
import { useForm } from 'react-final-form';
import { Box, Divider, makeStyles } from '@material-ui/core';

import { OrderStatus } from '../../../../graphql/api';
import { BackButton } from '../../components/BackButton';
import { CompleteOrderButton } from '../../components/CompleteOrderButton';
import { SaveButton } from '../../components/SaveButton';
import { useUserIsAllowedToWeightOutOrder } from '../../hooks/useUserIsAllowedToWeightOutOrder';
import { setWeightOutFromScale } from '../../helpers/setWeightOutFromScale';
import { useScale } from '../../../../hooks/useScale';

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

export const DumpOrderPaymentFooter: FC<Props> = ({ onBack, onChangeStep }) => {
  const classes = useStyles();
  const form = useForm();
  const scale = useScale();
  const isAllowedToWeightOutOrder = useUserIsAllowedToWeightOutOrder();

  const handleBackButton = useCallback(async () => {
    if (onChangeStep) {
      try {
        await onChangeStep();
      } catch {
        return;
      }
    }

    form.reset();
    setWeightOutFromScale(form, scale, OrderStatus.WeightOut);

    if (onBack) {
      onBack();
    }
  }, [form, onBack, onChangeStep, scale]);

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <BackButton disabled={!isAllowedToWeightOutOrder} handleSubmit={handleBackButton} />
          <SaveButton />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <CompleteOrderButton />
        </Box>
      </Box>
    </Box>
  );
};
