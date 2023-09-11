import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import TruckQuickViewContent from './TruckQuickViewContent';

const TruckQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { truckStore } = useStores();

  return (
    <QuickView store={truckStore} {...quickViewProps}>
      <TruckQuickViewContent />
    </QuickView>
  );
};

export default observer(TruckQuickView);
