import React from 'react';
import { Box, Divider, Grid } from '@material-ui/core';
import { Field } from 'react-final-form';

import { MaterialDistributionInput, MiscellaneousItemsInput } from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';
import { WeightOutForm } from '../WeightOutOrderForm/WeightOutForm';
import { ImagesContainer } from '../ArrivalDumpOrderForm/ImagesContainer';
import { OrderPaymentForm } from '../DumpOrderPaymentForm/OrderPaymentForm';

interface Props extends ReadOnlyOrderFormComponent {}

export const ApprovedOrderForm: React.FC<Props> = ({ readOnly }) => {
  return (
    <Box>
      <WeightOutForm readOnly={readOnly} />
      <Divider />
      <Box mt={2} mb={4}>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <MaterialDistributionInput readOnly={readOnly} />
          </Grid>
          <Grid item xs={6}>
            <MiscellaneousItemsInput readOnly={readOnly} />
          </Grid>
        </Grid>
        <Divider />
        <Box mb={3} />
        <Field name="id" subscription={{ value: true }}>
          {({ input: { value: orderId } }) => (
            <ImagesContainer orderId={orderId} readOnly={readOnly} />
          )}
        </Field>
      </Box>
      <Divider />
      <OrderPaymentForm />
    </Box>
  );
};
