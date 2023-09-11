import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';

import { IDailyRoute } from '@root/types';

import { DetailsTab } from './Details';
import { WorkOrdersTab } from './WorkOrders';

const tabs = {
  details: DetailsTab,
  workOrders: WorkOrdersTab,
};

interface ITabs {
  dailyRoute: IDailyRoute;
}

export type TabsConfigType = 'details' | 'workOrders';

const I18N_PATH = 'quickViews.DailyRouteForm.Text.';

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
