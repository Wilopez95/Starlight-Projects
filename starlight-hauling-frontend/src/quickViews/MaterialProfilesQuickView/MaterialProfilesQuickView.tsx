import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import MaterialProfilesQuickViewContent from './MaterialProfilesQuickViewContent';

const MaterialProfilesQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { materialProfileStore } = useStores();

  return (
    <QuickView store={materialProfileStore} {...quickViewProps}>
      <MaterialProfilesQuickViewContent />
    </QuickView>
  );
};

export default observer(MaterialProfilesQuickView);
