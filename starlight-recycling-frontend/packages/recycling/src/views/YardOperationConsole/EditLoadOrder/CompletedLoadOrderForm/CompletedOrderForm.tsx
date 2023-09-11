import React from 'react';
import { Box, Divider } from '@material-ui/core';
import { ReadOnlyOrderFormComponent } from '../../types';
import { OrderLoadForm } from '../LoadOrderForm/OrderLoadForm';
import { OrderPaymentForm } from '../../EditDumpOrder/DumpOrderPaymentForm/OrderPaymentForm';
import { UnitOfMeasurementType } from '../../../../constants/unitOfMeasurement';

interface Props extends ReadOnlyOrderFormComponent {
  weightUOM?: UnitOfMeasurementType;
}

export const CompletedOrderForm: React.FC<Props> = ({ readOnly, weightUOM }) => {
  return (
    <Box>
      <OrderLoadForm readOnly={readOnly} weightUOM={weightUOM} />
      <Divider />
      <OrderPaymentForm readOnly={readOnly} />
    </Box>
  );
};
