import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import TruckAndDriverQuickViewContent from './TruckAndDriverQuickViewContent';

const TruckAndDriverQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { truckAndDriverCostStore } = useStores();

  return (
    <QuickView store={truckAndDriverCostStore} size="three-quarters" {...quickViewProps}>
      <TruckAndDriverQuickViewContent />
    </QuickView>
  );
};

export default observer(TruckAndDriverQuickView);
