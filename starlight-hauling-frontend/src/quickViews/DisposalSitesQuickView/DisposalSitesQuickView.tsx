import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import DisposalSitesQuickViewContent from './DisposalSitesQuickViewContent';

export const DisposalSitesQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { disposalSiteStore } = useStores();

  return (
    <QuickView store={disposalSiteStore} size="half" {...quickViewProps}>
      <DisposalSitesQuickViewContent />
    </QuickView>
  );
};
