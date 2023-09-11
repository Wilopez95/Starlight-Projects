import React from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import TaxDistrictQuickViewContent from './TaxDistrictQuickViewContent';

const TaxDistrictQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { taxDistrictStore } = useStores();

  return (
    <QuickView store={taxDistrictStore} size="half" {...quickViewProps}>
      <TaxDistrictQuickViewContent />
    </QuickView>
  );
};

export default observer(TaxDistrictQuickView);
