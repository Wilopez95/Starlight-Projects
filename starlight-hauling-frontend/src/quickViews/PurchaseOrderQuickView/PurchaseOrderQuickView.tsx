import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@hooks';

import PurchaseOrderQuickViewContent from './PurchaseOrderQuickViewContent';

const PurchaseOrderQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { purchaseOrderStore } = useStores();

  return (
    <QuickView store={purchaseOrderStore} size="default" {...quickViewProps}>
      <PurchaseOrderQuickViewContent />
    </QuickView>
  );
};

export default PurchaseOrderQuickView;
