import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import QbIntegrationQuickViewContent from './QbIntegrationQuickViewContent';

export const QbIntegrationQuickView: React.FC<ICustomQuickView> = quicViewProps => {
  const { qbIntegrationSettingsStore } = useStores();

  return (
    <QuickView {...quicViewProps} store={qbIntegrationSettingsStore}>
      <QbIntegrationQuickViewContent />
    </QuickView>
  );
};
