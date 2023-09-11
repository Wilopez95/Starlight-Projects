import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import TruckTypeQuickViewContent from './TruckTypeQuickViewContent';

const TruckTypeQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { truckTypeStore } = useStores();

  return (
    <QuickView store={truckTypeStore} {...quickViewProps}>
      <TruckTypeQuickViewContent />
    </QuickView>
  );
};

export default observer(TruckTypeQuickView);
