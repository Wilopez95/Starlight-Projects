import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, Switch } from 'react-router-dom';
import {
  Button,
  Layouts,
  PlusIcon,
  RoutingNavigationItem,
  Typography,
} from '@starlightpro/shared-components';
import noop from 'lodash-es/noop';
import { observer } from 'mobx-react-lite';

import { TableNavigationHeader, TablePageContainer } from '@root/common/TableTools';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { BusinessUnitLayout } from '@root/pages/layouts/BusinessUnitLayout';
import { MapSettingsProvider } from '@root/providers/MapSettingsProvider/MapSettingsProvider';
import { CalendarAdapter as Calendar } from '@root/widgets/CalendarAdapter/Calendar';
import { BulkReschedule, WorkOrderUpdateStatus } from '@root/widgets/modals';

import { RouteModules } from '@root/consts/routing/Paths';
import { DispatcherRoute } from './DispatcherRoute';
import { CalendarWrapper } from './styled';
import { TabsEnum } from './types';
import { useRouting } from './useRouting';

const I18N_PATH_HEADER = 'pages.Dispatcher.components.Header.Text.';
const I18N_PATH_TABS = 'pages.Dispatcher.components.Tabs.Text.';

const TabsTitleTextKeys = {
  [TabsEnum.DAILY_ROUTE_TAB]: 'DailyRoutes',
  [TabsEnum.MASTER_ROUTE_TAB]: 'MasterRoutes',
  [TabsEnum.WORK_ORDER_TAB]: 'WorkOrders',
  [TabsEnum.DASHBOARD_TAB]: 'Dashboard',
};

const DispatcherPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    haulingServiceItemStore,
    workOrderDailyRouteStore,
    masterRoutesStore,
    dailyRoutesStore,
    workOrdersStore,
    waypointsStore,
    dashboardStore,
  } = useStores();
  const { availableTabs, availableRoutes } = useRouting();
  const { businessUnitId } = useBusinessContext();
  const tableNavigationRef = useRef<HTMLDivElement | null>(null);
  const [currentTab, setCurrentTab] = useState<TabsEnum | null>(null);

  const toggleCreateRoute = useCallback(() => {
    const handlers = {
      [TabsEnum.MASTER_ROUTE_TAB]: () => masterRoutesStore.toggleMasterRouteModalSettings(),
      [TabsEnum.DAILY_ROUTE_TAB]: () => dailyRoutesStore.toggleDailyRouteModalSettings(),
      [TabsEnum.WORK_ORDER_TAB]: () => {},
      [TabsEnum.DASHBOARD_TAB]: () => {},
    };

    currentTab && handlers[currentTab]();
  }, [masterRoutesStore, dailyRoutesStore, currentTab]);

  const openMasterRoutesGrid = () => {
    const route = pathToUrl(RouteModules.MasterRouteGrid, {
      businessUnit: businessUnitId,
    });

    window.open(route, '_blank', 'width=800,height=600');
  };

  const toggleFilterHandler = useCallback(() => {
    const handlers = {
      [TabsEnum.MASTER_ROUTE_TAB]: () => masterRoutesStore.toggleFiltersRouteQuickView(),
      [TabsEnum.DAILY_ROUTE_TAB]: () => dailyRoutesStore.toggleFiltersRouteQuickView(),
      [TabsEnum.WORK_ORDER_TAB]: () => workOrdersStore.toggleQuickView(),
      [TabsEnum.DASHBOARD_TAB]: () => dashboardStore.toggleQuickView(),
    };

    currentTab && handlers[currentTab]();
  }, [currentTab, masterRoutesStore, dailyRoutesStore, workOrdersStore, dashboardStore]);

  const isAdditionalFilterActive = useMemo(() => {
    // TODO Active filter icon must be when filter data is changed (not default)
    const handlers = {
      [TabsEnum.MASTER_ROUTE_TAB]: masterRoutesStore.isFiltersModalOpen,
      [TabsEnum.DAILY_ROUTE_TAB]: dailyRoutesStore.isFiltersModalOpen,
      [TabsEnum.WORK_ORDER_TAB]: workOrdersStore.isOpenQuickView,
      [TabsEnum.DASHBOARD_TAB]: dashboardStore.isOpenQuickView,
    };

    return currentTab ? handlers[currentTab] : false;
  }, [
    masterRoutesStore.isFiltersModalOpen,
    dailyRoutesStore.isFiltersModalOpen,
    workOrdersStore.isOpenQuickView,
    dashboardStore.isOpenQuickView,
    currentTab,
  ]);

  const renderCalendars = useCallback(() => {
    if (!currentTab || currentTab === TabsEnum.MASTER_ROUTE_TAB) {
      return null;
    }

    const handlers = {
      [TabsEnum.DAILY_ROUTE_TAB]: {
        minDate: new Date(),
        value: dailyRoutesStore.selectedServiceDate,
        onDateChange: (_: string, date: Date) => {
          dailyRoutesStore.setSelectedServiceDate(date);
        },
      },
      [TabsEnum.WORK_ORDER_TAB]: {
        value: workOrdersStore.serviceDate,
        onDateChange: (_: string, date: Date) => {
          workOrdersStore.setServiceDate(date);
        },
      },
      [TabsEnum.DASHBOARD_TAB]: {
        value: dashboardStore.serviceDate,
        onDateChange: (_: string, date: Date) => {
          dashboardStore.setServiceDate(date);
        },
      },
    };

    return (
      <CalendarWrapper>
        <Calendar
          name="serviceDate"
          label={t(`${I18N_PATH_HEADER}CalendarLabel`)}
          withInput
          {...handlers[currentTab]}
        />
      </CalendarWrapper>
    );
  }, [currentTab, dailyRoutesStore, workOrdersStore, dashboardStore, t]);

  const onSearch = useMemo(() => {
    const handlers = {
      [TabsEnum.MASTER_ROUTE_TAB]: haulingServiceItemStore.onSearch,
      [TabsEnum.DAILY_ROUTE_TAB]: workOrderDailyRouteStore.onSearch,
      [TabsEnum.WORK_ORDER_TAB]: (searchInput: string) => {
        workOrdersStore.onSearch(businessUnitId, searchInput);
      },
      [TabsEnum.DASHBOARD_TAB]: (searchInput: string) => {
        dashboardStore.onSearch(businessUnitId, searchInput);
      },
    };

    return currentTab ? handlers[currentTab] : noop;
  }, [
    currentTab,
    workOrderDailyRouteStore,
    haulingServiceItemStore,
    workOrdersStore,
    dashboardStore,
    businessUnitId,
  ]);

  const getInputPlaceholder = useMemo(() => {
    const handlers = {
      [TabsEnum.MASTER_ROUTE_TAB]: `${I18N_PATH_TABS}MasterRouteInputPlaceholder`,
      [TabsEnum.DAILY_ROUTE_TAB]: `${I18N_PATH_TABS}DailyRouteInputPlaceholder`,
      [TabsEnum.WORK_ORDER_TAB]: `${I18N_PATH_TABS}WorkOrderInputPlaceholder`,
      [TabsEnum.DASHBOARD_TAB]: `${I18N_PATH_TABS}DashboardInputPlaceholder`,
    };

    return currentTab ? t(handlers[currentTab]) : '';
  }, [t, currentTab]);

  const onTabEnter = useCallback(
    (tab: TabsEnum) => {
      setCurrentTab(tab);
    },
    [setCurrentTab],
  );

  const routingNavigationConfig = useMemo(() => {
    return availableTabs.map<RoutingNavigationItem>(route => ({
      content: route.content,
      to: pathToUrl(route.to, {
        businessUnit: businessUnitId,
      }),
      disabled: route.disabled,
    }));
  }, [availableTabs, businessUnitId]);

  useEffect(() => {
    waypointsStore.getWayPointsList();
  }, [waypointsStore]);

  return (
    <>
      <Helmet
        title={
          currentTab
            ? t(`${I18N_PATH_TABS}${TabsTitleTextKeys[currentTab]}`)
            : t(`${I18N_PATH_HEADER}Title`)
        }
      />
      <BusinessUnitLayout>
        {availableRoutes.length > 0 && (
          <TablePageContainer>
            <Layouts.Margin bottom="3">
              <Layouts.Flex justifyContent="space-between" alignItems="center">
                <Layouts.Flex>
                  <Typography variant="headerTwo">
                    {currentTab ? t(`${I18N_PATH_TABS}${TabsTitleTextKeys[currentTab]}`) : null}
                  </Typography>
                  <Layouts.Margin left="1">{renderCalendars()}</Layouts.Margin>
                </Layouts.Flex>
                {currentTab !== TabsEnum.WORK_ORDER_TAB && currentTab !== TabsEnum.DASHBOARD_TAB && (
                  <Layouts.Flex>
                    {currentTab === TabsEnum.MASTER_ROUTE_TAB && (
                      <Button variant="white" onClick={() => openMasterRoutesGrid()}>
                        {t(`${I18N_PATH_HEADER}MasterRoutesGridButton`)}
                      </Button>
                    )}

                    <Layouts.Margin right="1"></Layouts.Margin>
                    <Button variant="primary" onClick={toggleCreateRoute} iconLeft={PlusIcon}>
                      {t(`${I18N_PATH_HEADER}CreateNewRouteButton`)}
                    </Button>
                  </Layouts.Flex>
                )}
                {currentTab === TabsEnum.WORK_ORDER_TAB && (
                  <Layouts.Flex>
                    <BulkReschedule />
                    <Layouts.Margin right="2" />
                    <WorkOrderUpdateStatus />
                  </Layouts.Flex>
                )}
              </Layouts.Flex>
            </Layouts.Margin>
            <TableNavigationHeader
              routes={routingNavigationConfig}
              placeholder={getInputPlaceholder}
              onSearch={onSearch}
              navigationRef={tableNavigationRef}
              additionalFilterActive={isAdditionalFilterActive}
              additionalFilterHandler={toggleFilterHandler}
            />
            <MapSettingsProvider>
              <Switch>
                {availableRoutes.map(({ tab, path, Component }) => (
                  <DispatcherRoute key={path} tab={tab} onTabEnter={onTabEnter} path={path}>
                    <Component tableNavigationRef={tableNavigationRef} />
                  </DispatcherRoute>
                ))}

                <Redirect to={availableRoutes[0].path} />
              </Switch>
            </MapSettingsProvider>
          </TablePageContainer>
        )}
      </BusinessUnitLayout>
    </>
  );
};

export default observer(DispatcherPage);
