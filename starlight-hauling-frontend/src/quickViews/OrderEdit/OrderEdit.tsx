import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import { IOrderEditQuickView } from './RightPanel/types';
import OrderEditFormContainer from './OrderEditFormContainer';

const OrderEdit: React.FC<IOrderEditQuickView & ICustomQuickView> = ({
  isDeferredPage = false,
  ...quickViewProps
}) => {
  const { orderStore } = useStores();

  return (
    <QuickView
      store={orderStore}
      size="three-quarters"
      onClose={orderStore.closeEdit}
      {...quickViewProps}
    >
      <OrderEditFormContainer isDeferredPage={isDeferredPage} />
    </QuickView>
  );
};

export default OrderEdit;
