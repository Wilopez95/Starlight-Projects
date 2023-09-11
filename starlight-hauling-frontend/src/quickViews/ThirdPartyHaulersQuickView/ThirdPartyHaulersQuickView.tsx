import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ThirdPartyHaulersQuickViewContent from './ThirdPartyHaulersQuickViewContent';

const ThirdPartyHaulersQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { thirdPartyHaulerStore } = useStores();

  return (
    <QuickView store={thirdPartyHaulerStore} {...quickViewProps}>
      <ThirdPartyHaulersQuickViewContent />
    </QuickView>
  );
};

export default observer(ThirdPartyHaulersQuickView);
