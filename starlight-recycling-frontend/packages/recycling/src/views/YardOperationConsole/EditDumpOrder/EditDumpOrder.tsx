import React, { FC } from 'react';
import { GetOrderQuery, OrderStatus, OrderUpdateInput } from '../../../graphql/api';

import { InvoicedDumpOrderForm } from './InvoicedDumpOrderForm';
import { FinalizedDumpOrderForm } from './FinalizedDumpOrderForm';
import { ApprovedDumpOrderForm } from './ApprovedDumpOrderForm';
import { CompletedDumpOrderForm } from './CompletedDumpOrderForm';
import { ReadOnlyOrderFormComponent } from '../types';
import { EditOrderFormWrapperProps } from '../components/EditOrderFormWrapper';
import { FullTruckToScaleForm } from '../FullTruckToScaleForm';
import PreCompleteDumpOrderForm from './PreCompleteDumpOrderForm';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data?: OrderUpdateInput) => Promise<void>;
  onChangeStep?: () => void;
  isParsedToUOM: boolean;
  doConvertWeights?: boolean;
  onBackStep?(status: GetOrderQuery['order']['status']): void;
}

export const EditDumpOrder: FC<Props> = (props) => {
  const { doConvertWeights = true } = props;
  const { status } = props.order;

  if (status === OrderStatus.OnTheWay) {
    return <FullTruckToScaleForm {...props} />;
  }

  if ([OrderStatus.InYard, OrderStatus.WeightOut, OrderStatus.Payment].includes(status)) {
    return <PreCompleteDumpOrderForm {...props} />;
  }

  if (status === OrderStatus.Completed) {
    return <CompletedDumpOrderForm {...props} doConvertWeights={doConvertWeights} />;
  }

  if (status === OrderStatus.Approved) {
    return <ApprovedDumpOrderForm {...props} />;
  }

  if (status === OrderStatus.Finalized) {
    return <FinalizedDumpOrderForm {...props} readOnly />;
  }

  if (status === OrderStatus.Invoiced) {
    return <InvoicedDumpOrderForm {...props} readOnly />;
  }

  return null;
};
