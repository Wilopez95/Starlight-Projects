import React, { useMemo, useState } from 'react';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';

import { Item } from '../Item';

interface ITabs {
  jobSiteGroupedItems: number[];
}

export const Tabs: React.FC<ITabs> = observer(({ jobSiteGroupedItems }) => {
  const { workOrderDailyRouteStore } = useStores();

  const tabs: NavigationConfigItem<string>[] = useMemo(() => {
    return jobSiteGroupedItems.map((id, index) => {
      const { displayId = '-' } = workOrderDailyRouteStore.getById(id) ?? {};

      return {
        label: <>#{displayId}</>,
        key: `${id}`,
        index,
      };
    });
  }, [jobSiteGroupedItems, workOrderDailyRouteStore]);

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<string>>(tabs[0]);

  const onTabChange = (tab: NavigationConfigItem<string>) => {
    setCurrentTab(tab);
  };

  return (
    <>
      <Navigation
        activeTab={currentTab}
        configs={tabs}
        onChange={onTabChange}
        border
        carousel
        withEmpty
      />
      <Layouts.Padding top="3">
        <Item pinItemId={+currentTab.key} />
      </Layouts.Padding>
    </>
  );
});
