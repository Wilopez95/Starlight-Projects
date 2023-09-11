import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import DisposalRatesQuickViewContent from './DisposalRatesQuickViewContent';

export const DisposalRatesQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { disposalSiteStore } = useStores();

  return (
    <QuickView
      onClose={() => disposalSiteStore.closeRates()}
      store={disposalSiteStore}
      size="half"
      {...quickViewProps}
    >
      <DisposalRatesQuickViewContent />
    </QuickView>
  );
};
