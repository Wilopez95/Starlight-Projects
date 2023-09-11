import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';

import { useMasterRoutesMap } from '@root/providers/MasterRoutesMapProvider';
import { IMasterRoute, IMasterRouteServiceItem } from '@root/types';

import { DetailsTab } from './Details';
import { ServicesTab } from './Services';

export type TabsConfigType = 'details' | 'services';

const I18N_PATH = 'quickViews.MasterRouteView.Text.';

const tabs = {
  details: DetailsTab,
  services: ServicesTab,
};

interface ITabs {
  masterRoute: IMasterRoute;
}
// TODO refactor tabs to reuse this also with daily routes
export const Tabs: React.FC<ITabs> = ({ masterRoute }) => {
  const { t } = useTranslation();
  const { setPopupInfo } = useMasterRoutesMap();

  const detailsTabsConfig: NavigationConfigItem<TabsConfigType>[] = useMemo(() => {
    return [
      {
        label: t(`${I18N_PATH}TabDetailsTitle`),
        key: 'details',
        index: 0,
      },
      {
        label: t(`${I18N_PATH}TabServicesTitle`, {
          servicesCount: masterRoute.serviceItems.length,
        }),
        key: 'services',
        index: 1,
      },
    ];
  }, [t, masterRoute]);

  const [activeTab, setActiveTab] = useState<NavigationConfigItem<TabsConfigType>>(
    detailsTabsConfig[0],
  );
  const CurrentForm = tabs[activeTab.key];

  const onTabChange = (tab: NavigationConfigItem<TabsConfigType>) => {
    setActiveTab(tab);
  };

  const onPopup = (serviceItem: IMasterRouteServiceItem) => {
    // Show popup when clicked on pin in list
    // TODO verify correct id
    setPopupInfo({
      coordinates: serviceItem.jobSite.coordinates,
      rootMarkerId: serviceItem.id,
      jobSiteId: serviceItem.jobSiteId,
      pinItemId: serviceItem.haulingId,
      color: '',
    });
  };

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
        <CurrentForm {...masterRoute} onPopup={onPopup} />
      </Layouts.Margin>
    </>
  );
};
