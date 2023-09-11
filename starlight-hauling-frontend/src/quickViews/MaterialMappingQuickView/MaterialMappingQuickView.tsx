import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import MaterialMappingQuickViewContent from './MaterialMappingQuickViewContent';

const MaterialMappingQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { disposalSiteStore } = useStores();

  return (
    <QuickView store={disposalSiteStore} size="half" {...quickViewProps}>
      <MaterialMappingQuickViewContent />
    </QuickView>
  );
};

export default observer(MaterialMappingQuickView);
