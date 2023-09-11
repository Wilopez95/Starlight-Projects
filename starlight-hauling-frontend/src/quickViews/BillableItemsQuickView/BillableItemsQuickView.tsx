import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';

import { ICustomQuickView, QuickView } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import BillableItemsQuickViewContent from './BillableItemsQuickViewContent';
import { BillableItemType, BillableItemTypes } from './types';

const BillableItemsQuickView: React.FC<
  ICustomQuickView & { selectedTab: BillableItemTypes; quickViewSubtitle: string }
> = quickViewProps => {
  const { billableServiceStore, thresholdStore, lineItemStore, surchargeStore } = useStores();

  const activeStore = useMemo(() => {
    switch (quickViewProps.selectedTab) {
      case BillableItemType.service:
      case BillableItemType.recurringService:
        return billableServiceStore;
      case BillableItemType.lineItem:
      case BillableItemType.recurringLineItem:
        return lineItemStore;
      case BillableItemType.threshold:
        return thresholdStore;
      case BillableItemType.surcharge:
        return surchargeStore;
      default:
        return billableServiceStore;
    }
  }, [
    billableServiceStore,
    lineItemStore,
    quickViewProps.selectedTab,
    surchargeStore,
    thresholdStore,
  ]);

  return (
    <QuickView store={activeStore} {...quickViewProps}>
      <BillableItemsQuickViewContent
        store={activeStore}
        selectedTab={quickViewProps.selectedTab}
        quickViewSubtitle={quickViewProps.quickViewSubtitle}
      />
    </QuickView>
  );
};

export default observer(BillableItemsQuickView);
