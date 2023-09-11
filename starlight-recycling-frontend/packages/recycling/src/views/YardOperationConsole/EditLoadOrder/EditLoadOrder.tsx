import React, { FC } from 'react';
import { GetOrderQuery, OrderStatus, OrderUpdateInput } from '../../../graphql/api';

import { CompletedLoadOrderForm } from './CompletedLoadOrderForm';
import { ApprovedLoadOrderForm } from './ApprovedLoadOrderForm';
import { FinalizedLoadOrderForm } from './FinalizedLoadOrderForm';
import { InvoicedLoadOrderForm } from './InvoicedLoadOrderForm';
import { ReadOnlyOrderFormComponent } from '../types';
import { EditOrderFormWrapperProps } from '../components/EditOrderFormWrapper';
import PreCompleteLoadOrderForm from './PreCompleteLoadOrderForm';

interface Props extends ReadOnlyOrderFormComponent, Pick<EditOrderFormWrapperProps, 'noDrawer'> {
  order: GetOrderQuery['order'];
  updateOrder: (data: OrderUpdateInput) => Promise<void>;
  onSubmitted?: (data?: OrderUpdateInput) => Promise<void>;
  noDrawer?: boolean;
  onChangeStep?: () => void;
  isParsedToUOM: boolean;
  doConvertWeights?: boolean;
}

export const EditLoadOrder: FC<Props> = (props) => {
  const { doConvertWeights = true } = props;
  const { status } = props.order;

  if ([OrderStatus.InYard, OrderStatus.Load, OrderStatus.Payment].includes(status)) {
    return <PreCompleteLoadOrderForm {...props} />;
  }

  if (status === OrderStatus.Completed) {
    return <CompletedLoadOrderForm {...props} doConvertWeights={doConvertWeights} />;
  }

  if (status === OrderStatus.Approved) {
    return <ApprovedLoadOrderForm {...props} />;
  }

  if (status === OrderStatus.Finalized) {
    return <FinalizedLoadOrderForm {...props} readOnly />;
  }

  if (status === OrderStatus.Invoiced) {
    return <InvoicedLoadOrderForm {...props} readOnly />;
  }

  return null;
};
