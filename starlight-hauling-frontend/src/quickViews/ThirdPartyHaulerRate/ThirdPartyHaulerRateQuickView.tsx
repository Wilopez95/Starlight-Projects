import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import ThirdPartyHaulerRateQuickViewContent from './ThirdPartyHaulerRateQuickViewContent';

const ThirdPartyHaulerRateQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { thirdPartyHaulerStore } = useStores();

  return (
    <QuickView store={thirdPartyHaulerStore} size="three-quarters" {...quickViewProps}>
      <ThirdPartyHaulerRateQuickViewContent />
    </QuickView>
  );
};

export default observer(ThirdPartyHaulerRateQuickView);
