import React from 'react';

import { ICustomQuickView, QuickView } from '@root/common';
import { useStores } from '@root/hooks';

import RoleQuickViewContent from './RoleContent';

export const RoleQuickView: React.FC<ICustomQuickView> = quickViewProps => {
  const { roleStore } = useStores();

  return (
    <QuickView store={roleStore} size="half" {...quickViewProps}>
      <RoleQuickViewContent />
    </QuickView>
  );
};
