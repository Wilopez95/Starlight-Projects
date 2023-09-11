import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import DriverQuickViewContent from './DriverQuickViewContent';

export const DriverQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { driverStore } = useStores();

  return (
    <QuickView store={driverStore} {...quickViewProps}>
      <DriverQuickViewContent />
    </QuickView>
  );
};
