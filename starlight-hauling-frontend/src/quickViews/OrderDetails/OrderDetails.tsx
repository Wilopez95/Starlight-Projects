import React from 'react';
import { observer } from 'mobx-react-lite';

import { QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import OrderDetailsFormContainer from './OrderDetailsFormContainer';
import { OrderDetailsQuickViewProps } from './types';

const OrderDetails: React.FC<OrderDetailsQuickViewProps> = ({
  shouldRemoveOrderFromStore,
  ...quickViewProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView
      store={orderStore}
      size="three-quarters"
      onClose={orderStore.closeDetails}
      {...quickViewProps}
    >
      <OrderDetailsFormContainer shouldRemoveOrderFromStore={shouldRemoveOrderFromStore} />
    </QuickView>
  );
};

export default observer(OrderDetails);
