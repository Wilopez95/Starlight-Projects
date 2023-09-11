import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import CustomRateQuickViewContent from './CustomRateQuickViewContent';

const CustomRateQuickView: React.FC<ICustomQuickView> = ({ ...quickViewProps }) => {
  const { priceGroupStoreNew } = useStores();

  return (
    <QuickView store={priceGroupStoreNew} size="three-quarters" {...quickViewProps}>
      <CustomRateQuickViewContent />
    </QuickView>
  );
};

export default CustomRateQuickView;
