import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import ConfigurationBrokerContent from './ConfigurationBrokerContent';

export const ConfigurationBrokerQuickView: React.FC<ICustomQuickView> = quicViewProps => {
  const { brokerStore } = useStores();

  return (
    <QuickView {...quicViewProps} store={brokerStore}>
      <ConfigurationBrokerContent />
    </QuickView>
  );
};
