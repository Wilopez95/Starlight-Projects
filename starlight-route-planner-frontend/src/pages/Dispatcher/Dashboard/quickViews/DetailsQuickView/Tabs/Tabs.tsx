import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';

import { IDashboardDailyRoute } from '@root/types';

import { DetailsTab } from './Details';
import { HistoryTab } from './History';
import { WorkOrdersTab } from './WorkOrders';

const tabs = {
  details: DetailsTab,
  workOrders: WorkOrdersTab,
  history: HistoryTab,
};

interface ITabs {
  dailyRoute: IDashboardDailyRoute;
}

export type TabsConfigType = 'details' | 'workOrders' | 'history';

const I18N_PATH = 'quickViews.DashboardDailyRoute.Text.';

export const Tabs: React.FC<ITabs> = ({ dailyRoute }) => {
  const { t } = useTranslation();

  const detailsTabsConfig: NavigationConfigItem<TabsConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH}TabDetailsTitle`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH}TabWorkOrdersTitle`, {
          workOrdersCount: dailyRoute.workOrders.length || 0,
        }),
        key: 'workOrders',
        index: 1,
      },
      {
        label: t(`${I18N_PATH}TabHistoryTitle`),
        key: 'history',
        index: 2,
      },
    ];
  }, [t, dailyRoute]);

  const [activeTab, setActiveTab] = useState<NavigationConfigItem<TabsConfigType>>(
    detailsTabsConfig[0],
  );

  const onTabChange = (tab: NavigationConfigItem<TabsConfigType>) => {
    setActiveTab(tab);
  };

  const CurrentForm = tabs[activeTab.key];

  return (
    <>
      <Navigation
        activeTab={activeTab}
        configs={detailsTabsConfig}
        onChange={onTabChange}
        border
        withEmpty
      />
      <Layouts.Margin top="2">
        <CurrentForm dailyRoute={dailyRoute} />
      </Layouts.Margin>
    </>
  );
};
