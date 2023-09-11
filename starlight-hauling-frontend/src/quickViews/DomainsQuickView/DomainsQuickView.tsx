import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import DomainsQuickViewContent from './DomainsQuickViewContent';

export const DomainsQuickView: React.FC<ICustomQuickView> = quicViewProps => {
  const { domainStore } = useStores();

  return (
    <QuickView {...quicViewProps} store={domainStore}>
      <DomainsQuickViewContent />
    </QuickView>
  );
};
