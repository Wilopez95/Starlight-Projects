import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import MaterialsQuickViewContent from './MaterialsQuickViewContent';

const MaterialsQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { materialStore } = useStores();

  return (
    <QuickView store={materialStore} {...quickViewProps}>
      <MaterialsQuickViewContent />
    </QuickView>
  );
};

export default observer(MaterialsQuickView);
