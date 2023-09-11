import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import PermitsQuickViewContent from './PermitsQuickViewContent';

const UserQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { permitStore } = useStores();

  return (
    <QuickView store={permitStore} {...quickViewProps}>
      <PermitsQuickViewContent />
    </QuickView>
  );
};

export default observer(UserQuickView);
