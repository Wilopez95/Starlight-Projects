import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import BusinessLineQuickViewContent from './BusinessLineQuickViewContent';

const BusinessLineQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { businessLineStore } = useStores();

  return (
    <QuickView store={businessLineStore} size="default" {...quickViewProps}>
      <BusinessLineQuickViewContent />
    </QuickView>
  );
};

export default observer(BusinessLineQuickView);
