import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { ReadOnlyOrderFormComponent } from '../../types';
import { OrderLoadForm } from '../LoadOrderForm/OrderLoadForm';
import { OrderPaymentForm } from '../../EditDumpOrder/DumpOrderPaymentForm/OrderPaymentForm';

interface Props extends ReadOnlyOrderFormComponent {}

export const FinalizedOrderForm: React.FC<Props> = ({ readOnly }) => {
  return (
    <Box>
      <OrderLoadForm readOnly={readOnly} />
      <Divider />
      <OrderPaymentForm readOnly={readOnly} />
    </Box>
  );
};
