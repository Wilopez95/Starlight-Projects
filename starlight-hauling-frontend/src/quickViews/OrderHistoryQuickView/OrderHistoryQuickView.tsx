import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import OrderHistoryQuickViewContent from './OrderHistoryQuickViewContent';
import { IOrderHistoryQuickView } from './types';

const OrderHistoryQuickView: React.FC<IOrderHistoryQuickView & ICustomQuickView> = ({
  orderId,
  ...quickViewProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView store={orderStore} shouldDeselect={false} overlay {...quickViewProps}>
      <OrderHistoryQuickViewContent orderId={orderId} />
    </QuickView>
  );
};

export default OrderHistoryQuickView;
