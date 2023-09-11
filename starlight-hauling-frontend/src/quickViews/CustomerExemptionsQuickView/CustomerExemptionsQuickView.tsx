import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import CustomerExemptionsQuickViewContent from './CustomerExemptionsQuickViewContent';

const CustomerExemptionsQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { customerStore } = useStores();

  return (
    <QuickView store={customerStore} size="half" shouldDeselect={false} {...quickViewProps}>
      <CustomerExemptionsQuickViewContent />
    </QuickView>
  );
};

export default CustomerExemptionsQuickView;
