import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Paths } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { useCrudPermissions } from '@root/hooks';

import { DailyRoutes } from './DailyRoutes/DailyRoutes';
import { Dashboard } from './Dashboard/Dashboard';
import { MasterRouter } from './MasterRouter/MasterRouter';
import { WorkOrders } from './WorkOrders/WorkOrders';
import { TabsEnum } from './types';

const I18N_PATH_TABS = 'pages.Dispatcher.components.Tabs.Text.';

export const useRouting = () => {
  const { t } = useTranslation();

  const handleUnavailableRouteEnter = useCallback(() => {
    NotificationHelper.error('routing', 'ACCESS_DENIED');
  }, []);

  const { hasFullAccess: isMasterRouteVisible } = useCrudPermissions(
    'routePlanner',
    'master-routes',
  );
  const { hasFullAccess: isDailyRouteVisible } = useCrudPermissions('routePlanner', 'daily-routes');
  const { hasFullAccess: isWorkOrderVisible } = useCrudPermissions(
    'routePlanner',
    'work-orders-list',
  );
  const { hasFullAccess: isDashboardVisible } = useCrudPermissions('routePlanner', 'dashboard');

  const availableTabs = [];
  const availableRoutes = [];

  if (isDashboardVisible) {
    availableTabs.push({
      content: t(`${I18N_PATH_TABS}Dashboard`),
      to: Paths.DispatchModule.Dashboard,
      disabled: false,
    });

    availableRoutes.push({
      path: Paths.DispatchModule.Dashboard,
      Component: Dashboard,
      tab: TabsEnum.DASHBOARD_TAB,
    });
  }

  if (isDailyRouteVisible) {
    availableTabs.push({
      content: t(`${I18N_PATH_TABS}DailyRoutes`),
      to: Paths.DispatchModule.DailyRoutes,
      disabled: false,
    });

    availableRoutes.push({
      path: Paths.DispatchModule.DailyRoutes,
      Component: DailyRoutes,
      tab: TabsEnum.DAILY_ROUTE_TAB,
    });
  }

  if (isMasterRouteVisible) {
    availableTabs.push({
      content: t(`${I18N_PATH_TABS}MasterRoutes`),
      to: Paths.DispatchModule.MasterRoutes,
      disabled: false,
    });

    availableRoutes.push({
      path: Paths.DispatchModule.MasterRoutes,
      Component: MasterRouter,
      tab: TabsEnum.MASTER_ROUTE_TAB,
    });
  }

  // availableRoutesTabs.push({
  //   content: t(`${I18N_PATH_TABS}DriversTrucks`),
  //   to: Paths.DispatchModule.DriversTracks,
  //   disabled: true,
  // });

  if (isWorkOrderVisible) {
    availableTabs.push({
      content: t(`${I18N_PATH_TABS}WorkOrders`),
      to: Paths.DispatchModule.WorkOrders,
      disabled: false,
    });

    availableRoutes.push({
      path: Paths.DispatchModule.WorkOrders,
      Component: WorkOrders,
      tab: TabsEnum.WORK_ORDER_TAB,
    });
  }

  useEffect(() => {
    if (availableRoutes.length < 1) {
      handleUnavailableRouteEnter();
    }
  }, [availableRoutes.length, handleUnavailableRouteEnter]);

  return {
    availableTabs,
    availableRoutes,
  };
};
