import React from 'react';
import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';
import AccountingLogQuickViewContent from './QbIntegrationLogQuickViewContent';

export const QbIntegrationLogQuickView: React.FC<ICustomQuickView> = quicViewProps => {
  const { qbIntegrationLogStore } = useStores();
  return (
    <QuickView {...quicViewProps} store={qbIntegrationLogStore}>
      <AccountingLogQuickViewContent />
    </QuickView>
  );
};
