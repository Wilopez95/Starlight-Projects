import React from 'react';

import { ICustomQuickView, QuickView, QuickViewPaths } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import LandfillOperationsEditQuickViewContent from './LandfillOperationsEditQuickViewContent';

export const LandfillOperationsEditQuickView: React.FC<
  ICustomQuickView & QuickViewPaths
> = quickViewProps => {
  const { landfillOperationStore } = useStores();

  return (
    <QuickView store={landfillOperationStore} size="three-quarters" {...quickViewProps}>
      <LandfillOperationsEditQuickViewContent />
    </QuickView>
  );
};
