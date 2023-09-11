import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { QuickView, QuickViewContent } from '@root/common/QuickView';
import { useStores } from '@root/hooks';

import RightPanel from './components/RightPanel/RightPanel';
import SubscriptionOrderViewActions from './components/sections/SubscriptionOrderViewActions/SubscriptionOrderViewActions';
import { ISubscriptionOrderQuickView } from './types';

const SubscriptionOrderQuickView: React.FC<ISubscriptionOrderQuickView> = ({
  tableContainerRef,
  ...quickViewProps
}) => {
  const { subscriptionOrderStore, subscriptionStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const subscription = subscriptionStore.selectedEntity;

  useEffect(() => {
    if (subscriptionOrder?.id) {
      subscriptionOrderStore.requestById(subscriptionOrder.id);
    }
  }, [subscriptionOrderStore, subscriptionOrder?.id]);

  if (!(subscription && subscriptionOrder)) {
    return null;
  }

  return (
    <QuickView size="three-quarters" store={subscriptionOrderStore} {...quickViewProps}>
      <QuickViewContent
        rightPanelElement={<RightPanel tableContainerRef={tableContainerRef} />}
        actionsElement={<SubscriptionOrderViewActions />}
      />
    </QuickView>
  );
};

export default observer(SubscriptionOrderQuickView);
