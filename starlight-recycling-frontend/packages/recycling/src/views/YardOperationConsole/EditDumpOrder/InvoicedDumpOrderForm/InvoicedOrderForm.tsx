import React from 'react';
import { Box, Divider, Grid } from '@material-ui/core';

import { MaterialDistributionInput, MiscellaneousItemsInput } from '../../Inputs';
import { ReadOnlyOrderFormComponent } from '../../types';
import { WeightOutForm } from '../WeightOutOrderForm/WeightOutForm';
import { ImagesContainer } from '../ArrivalDumpOrderForm/ImagesContainer';
import { OrderPaymentForm } from '../DumpOrderPaymentForm/OrderPaymentForm';

interface Props extends ReadOnlyOrderFormComponent {}

export const InvoicedOrderForm: React.FC<Props> = ({ readOnly }) => {
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
        <ImagesContainer orderId={1} readOnly={readOnly} />
      </Box>
      <Divider />
      <OrderPaymentForm readOnly={readOnly} />
    </Box>
  );
};
