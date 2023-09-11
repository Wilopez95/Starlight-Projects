import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import PriceGroupRatesQuickViewContent from './PriceGroupRatesQuickViewContent';

const PriceGroupRatesQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { priceGroupStore } = useStores();

  return (
    <QuickView store={priceGroupStore} size="three-quarters" {...quickViewProps}>
      <PriceGroupRatesQuickViewContent />
    </QuickView>
  );
};

export default PriceGroupRatesQuickView;
