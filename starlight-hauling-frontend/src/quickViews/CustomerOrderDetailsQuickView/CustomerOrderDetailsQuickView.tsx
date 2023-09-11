import React from 'react';

import { ICustomQuickView, QuickView, QuickViewContent, QuickViewPaths } from '@root/common';
import { useStores } from '@root/hooks';

import CustomerOrderDetailsActionsPanel from './CustomerOrderDetailsActionsPanel';
import CustomerOrderDetailsRightPanel from './CustomerOrderDetailsRightPanel';
import { ICustomerOrderDetailsActionsPanel } from './types';

export const CustomerOrderDetailsQuickView: React.FC<
  ICustomQuickView & QuickViewPaths & ICustomerOrderDetailsActionsPanel
> = ({ onOpenHistory, ...quickViewProps }) => {
  const { orderStore } = useStores();

  return (
    <QuickView overlay store={orderStore} size="three-quarters" {...quickViewProps}>
      <QuickViewContent
        rightPanelElement={<CustomerOrderDetailsRightPanel />}
        actionsElement={<CustomerOrderDetailsActionsPanel onOpenHistory={onOpenHistory} />}
      />
    </QuickView>
  );
};
