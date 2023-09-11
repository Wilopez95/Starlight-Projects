import React, { useCallback, useState } from 'react';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import WorkOrderMainInformation from '@root/quickViews/SubscriptionWorkOrderQuickView/components/WorkOrderMainInformation/WorkOrderMainInformation';
import WorkOrderMedia from '@root/quickViews/SubscriptionWorkOrderQuickView/components/WorkOrderMedia/WorkOrderMedia';

const workOrderNavigationItem: NavigationConfigItem[] = [
  { label: 'Main Information', key: '0', index: 0 },
  { label: 'Attached Media', key: '1', index: 1 },
];

const WorkOrderTabs: React.FC<{ height: number }> = ({ height }) => {
  const { subscriptionStore, subscriptionOrderStore } = useStores();
  const subscription = subscriptionStore.selectedEntity;
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(workOrderNavigationItem[0]);

  const handleNavigationChange = useCallback((tab: NavigationConfigItem) => {
    const index = tab.index;
    const current = index ? 1 : 0;

    setCurrentTab(workOrderNavigationItem[current]);
  }, []);

  if (!(subscription && subscriptionOrder)) {
    return null;
  }

  return (
    <>
      <Layouts.Margin left="2">
        <Navigation
          activeTab={currentTab}
          configs={workOrderNavigationItem}
          onChange={handleNavigationChange}
        />
      </Layouts.Margin>
      <Divider />
      <Layouts.Scroll height={height}>
        <Layouts.Padding left="3" right="3">
          {!currentTab.index ? (
            <WorkOrderMainInformation
              subscription={subscription}
              subscriptionOrder={subscriptionOrder}
            />
          ) : (
            <WorkOrderMedia />
          )}
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(WorkOrderTabs);
