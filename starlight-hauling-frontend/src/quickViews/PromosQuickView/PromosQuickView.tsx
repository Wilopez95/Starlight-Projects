import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import PromosQuickViewContent from './PromosQuickViewContent';

const UserQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { promoStore } = useStores();

  return (
    <QuickView store={promoStore} {...quickViewProps}>
      <PromosQuickViewContent />
    </QuickView>
  );
};

export default observer(UserQuickView);
