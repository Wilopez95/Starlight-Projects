import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Layouts, NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TablePageContainer, TableTools } from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { usePermission, useStores } from '@root/hooks';
import PageHeader from '@root/pages/SystemConfiguration/components/PageHeader/PageHeader';

import { TrucksAndDriversContext } from './components/TrucksAndDriversContainer/TrucksAndDriversContainer';
import { DriverFilters, TruckTypeFilters } from './components';
import { useNavigationConfig } from './navigationConfig';
import { TrucksAndDriversEnum } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const ConfigurationTrucksAndDrivers: React.FC = () => {
  const { truckTypeStore, truckStore } = useStores();
  const { t } = useTranslation();

  const canAccess = usePermission('configuration:drivers-trucks:list');

  const navConfig = useNavigationConfig();
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<TrucksAndDriversEnum>>(
    navConfig[0],
  );
  const [search, setSearch] = useState<string>();
  const [filterState, setFilterState] = useState<AppliedFilterState>({});

  const isTruckType = useMemo(
    () => currentTab.key === TrucksAndDriversEnum.TruckTypes,
    [currentTab.key],
  );
  const searchPlaceholder = useMemo(() => {
    switch (currentTab.key) {
      case TrucksAndDriversEnum.Trucks:
        return t(`${I18N_PATH}SearchTrucks`);
      case TrucksAndDriversEnum.Drivers:
        return t(`${I18N_PATH}SearchDrivers`);
      default:
        return null;
    }
  }, [currentTab.key, t]);

  useEffect(() => {
    if (!canAccess) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      truckTypeStore.markLoaded();
      truckStore.markLoaded();
    }
  }, [truckStore, truckTypeStore, canAccess]);

  const handleTabChange = useCallback((tab: NavigationConfigItem<TrucksAndDriversEnum>) => {
    setCurrentTab(tab);
    setSearch(undefined);
    setFilterState({});
  }, []);

  const Component = currentTab.component;
  const buttonContainer = useRef<HTMLDivElement>(null);

  const filterComponent = useMemo(() => {
    switch (currentTab.key) {
      case TrucksAndDriversEnum.Trucks:
        return <TruckTypeFilters onApply={setFilterState} />;

      case TrucksAndDriversEnum.Drivers:
        return <DriverFilters onApply={setFilterState} />;
      default:
        return undefined;
    }
  }, [currentTab.key]);

  return (
    <TablePageContainer>
      <PageHeader title={t('Titles.DriversAndTrucks')} hideSwitch>
        <Layouts.Flex justifyContent="flex-end" ref={buttonContainer} />
      </PageHeader>
      <Helmet title={t('Titles.DriversAndTrucks')} />

      <TrucksAndDriversContext.Provider value={{ ref: buttonContainer, search, filterState }}>
        <TableTools.HeaderNavigation
          tabs={navConfig}
          selectedTab={currentTab}
          onChangeTab={handleTabChange}
          onSearch={isTruckType ? undefined : setSearch}
          placeholder={searchPlaceholder ?? undefined}
          filterable={!isTruckType}
        >
          {filterComponent}
        </TableTools.HeaderNavigation>
        {Component ? <Component /> : null}
      </TrucksAndDriversContext.Provider>
    </TablePageContainer>
  );
};

export default observer(ConfigurationTrucksAndDrivers);
