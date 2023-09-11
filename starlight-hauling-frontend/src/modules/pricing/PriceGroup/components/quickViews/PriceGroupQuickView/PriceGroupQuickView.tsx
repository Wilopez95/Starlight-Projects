import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import PriceGroupQuickViewContent from './PriceGroupQuickViewContent';

const PriceGroupQuickView: React.FC<ICustomQuickView & QuickViewPaths> = ({
  ...quickViewProps
}) => {
  const { priceGroupStoreNew } = useStores();

  return (
    <QuickView store={priceGroupStoreNew} {...quickViewProps}>
      <PriceGroupQuickViewContent />
    </QuickView>
  );
};

export default PriceGroupQuickView;
