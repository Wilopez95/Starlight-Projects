import React, { FC } from 'react';
import { useForm } from 'react-final-form';
import { Box, Divider, makeStyles } from '@material-ui/core';

import { OrderStatus, OrderUpdateInput } from '../../../../graphql/api';
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

export interface LoadOrderFooterProps {
  onChangeStep?: () => void;
  onSubmitted?: (data?: OrderUpdateInput) => Promise<void>;
  onBack?(): void;
}

export const LoadOrderFooter: FC<LoadOrderFooterProps> = ({ onChangeStep, onBack }) => {
  const classes = useStyles();
  const form = useForm();
  const isAllowedInYardOrder = useUserIsAllowedToInYardOrder();

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <BackButton
            disabled={!isAllowedInYardOrder}
            handleSubmit={async () => {
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
            }}
          />
          <SaveButton isWeightCapturing />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <ToPaymentButton />
        </Box>
      </Box>
    </Box>
  );
};
