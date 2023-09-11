import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import CustomerQuickViewContent from './CustomerQuickViewContent';

const CustomerQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { customerStore } = useStores();

  return (
    <QuickView {...quickViewProps} store={customerStore}>
      <CustomerQuickViewContent />
    </QuickView>
  );
};

export default CustomerQuickView;
