import React from 'react';

import { ReadOnlyOrderFormComponent } from '../../types';
import { OrderPaymentForm } from '../../EditDumpOrder/DumpOrderPaymentForm/OrderPaymentForm';

interface Props extends ReadOnlyOrderFormComponent {}

export const NonServiceOrderForm: React.FC<Props> = ({ readOnly }) => {
  return <OrderPaymentForm readOnly={readOnly} weightTicket={false} />;
};
