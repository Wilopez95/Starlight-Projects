import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import CustomerGroupContent from './CustomerGroupContent';

export const ConfigurationCustomerGroupQuickView: React.FC<ICustomQuickView> = quicViewProps => {
  const { customerGroupStore } = useStores();

  return (
    <QuickView {...quicViewProps} store={customerGroupStore}>
      <CustomerGroupContent />
    </QuickView>
  );
};
