import React, { FC } from 'react';
import { Field, useForm } from 'react-final-form';
import { Box, Divider, makeStyles } from '@material-ui/core';

import { OrderStatus } from '../../../../graphql/api';
import { DeleteButton } from '../../components/DeleteButton';
import { DoneToScaleButton } from '../../components/DoneToScaleButton';
import { SaveButton } from '../../components/SaveButton';
import { useUserIsAllowedToLoadOrder } from '../../hooks/useUserIsAllowedToLoadOrder';

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
  orderId: number;
}

export const ArrivalLoadOrderFooter: FC<Props> = ({ orderId }) => {
  const classes = useStyles();
  const form = useForm();
  const isAllowedToLoadOrder = useUserIsAllowedToLoadOrder();

  return (
    <Box className={classes.footer}>
      <Divider />
      <Box display="flex" flexShrink="0" justifyContent="space-between" alignItems="flex-end">
        <Box display="flex" mt={3} className={classes.leftActions}>
          <Field name="departureAt" subscription={{ value: true }}>
            {({ input }) => !input.value && <DeleteButton orderId={orderId} />}
          </Field>
          <SaveButton />
        </Box>
        <Box display="flex" className={classes.rightActions}>
          <DoneToScaleButton
            disabled={!isAllowedToLoadOrder}
            handleSubmit={async () => {
              form.change('status', OrderStatus.Load);
              form.submit();
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
