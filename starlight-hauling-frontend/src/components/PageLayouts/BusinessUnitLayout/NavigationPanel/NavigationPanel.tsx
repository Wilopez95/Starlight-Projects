import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import {
  Button,
  Layouts,
  NavigationPanel,
  NavigationPanelItem,
} from '@starlightpro/shared-components';
import { type Location } from 'history';
import { observer } from 'mobx-react-lite';

import {
  BillingIcon,
  ChatsIcon,
  CirclePlusIcon,
  CustomersIcon,
  DispatcherIcon,
  DisposalSitesIcon,
  OrdersIcon,
  RecyclingIcon,
  ReportsIcon,
  RequestsIcon,
} from '@root/assets';
import { Protected } from '@root/common';
import { OrderStatusRoutes, Paths, Routes, SubscriptionOrderTabRoutes } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import { getCustomerNavigationTabs, pathToUrl, resolveCountExceed } from '@root/helpers';
import { BusinessUnitType } from '@root/types';
import {
  useBusinessContext,
  useCrudPermissions,
  useIsRecyclingFacilityBU,
  useStores,
  useSubscriptionSelectedTab,
  useUserContext,
} from '@hooks';

import { RecycleIconLayout } from '../styles';

const LIMIT = 9999;
const I18N_PATH = 'components.PageLayouts.BusinessUnitLayout.NavigationPanel.Text.';

const BusinessUnitNavigationPanel: React.FC = () => {
  const {
    orderStore,
    customerStore,
    customerGroupStore,
    jobSiteStore,
    subscriptionStore,
    subscriptionOrderStore,
    orderRequestStore,
    commonStore,
    landfillOperationStore,
    businessUnitStore,
    chatStore,
  } = useStores();

  const { currentUser } = useUserContext();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const businessUnit = businessUnitStore.getById(businessUnitId);

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const [canViewCustomerGroups] = useCrudPermissions('configuration', 'customer-groups');

  useEffect(() => {
    commonStore.requestNavigationCounts(businessUnitId, {
      withCustomerGroups: canViewCustomerGroups,
    });
    subscriptionStore.requestCount({ businessUnitId });
    subscriptionOrderStore.requestCount(businessUnitId);
  }, [
    commonStore,
    businessUnitId,
    canViewCustomerGroups,
    subscriptionStore,
    subscriptionOrderStore,
  ]);

  const handlePlaceNewOrderSubmit = useCallback(() => {
    customerStore.unSelectEntity();
    jobSiteStore.unSelectEntity();
  }, [customerStore, jobSiteStore]);

  const handleIsOrderActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.OrderModule.Orders,
        exact: true,
      }),
    [],
  );

  const handleIsMyOrderActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.OrderModule.MyOrders,
        exact: true,
      }),
    [],
  );

  const handleIsSubscriptionsActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.SubscriptionModule.Subscriptions,
        exact: true,
      }),
    [],
  );

  const handleIsMySubscriptionsActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.SubscriptionModule.MySubscriptions,
        exact: true,
      }),
    [],
  );

  const handleIsSubscriptionOrdersActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.SubscriptionModule.SubscriptionOrders,
        exact: true,
      }),
    [],
  );

  const handleIsReportActive = useCallback(
    (_, location: Location): boolean =>
      !!matchPath(location.pathname, {
        path: Paths.ReportsModule.Reports,
        exact: true,
      }),
    [],
  );

  const handleYardOperationsClick = useCallback(() => {
    window.location.href = `${process.env.RECYCLING_FE_URL!}/${
      currentUser!.tenantName
    }/recycling/${businessUnitId}/console/login?auto=true`;
  }, [businessUnitId, currentUser]);

  const orderRequestsUrl = pathToUrl(Paths.OrderModule.OrderRequests, {
    businessUnit: businessUnitId,
  });

  const chatsRequestsUrl = pathToUrl(Paths.Chats, {
    businessUnit: businessUnitId,
  });

  const ordersUrl = pathToUrl(Paths.OrderModule.Orders, {
    businessUnit: businessUnitId,
    subPath: isRecyclingFacilityBU ? OrderStatusRoutes.All : OrderStatusRoutes.InProgress,
  });

  const myOrdersUrl = pathToUrl(Paths.OrderModule.MyOrders, {
    businessUnit: businessUnitId,
    subPath: isRecyclingFacilityBU ? OrderStatusRoutes.All : OrderStatusRoutes.InProgress,
  });

  const invoiceUrl = pathToUrl(Paths.BillingModule.Invoices, {
    businessUnit: businessUnitId,
    subPath: undefined,
    id: undefined,
  });

  const reportsUrl = pathToUrl(Paths.ReportsModule.Reports, {
    businessUnit: businessUnitId,
    subPath: Routes.Operational,
  });

  const bankDepositsUrl = pathToUrl(Paths.BillingModule.BankDeposits, {
    businessUnit: businessUnitId,
    subPath: undefined,
    id: undefined,
  });

  const deferredPaymentsUrl = pathToUrl(Paths.BillingModule.DeferredPayments, {
    businessUnit: businessUnitId,
    id: undefined,
  });

  const paymentsAndPayoutsUrl = pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
    businessUnit: businessUnitId,
    subPath: undefined,
    id: undefined,
  });

  const subscriptionSelectedTab = useSubscriptionSelectedTab();

  const subscriptionRoute = pathToUrl(Paths.SubscriptionModule.Subscriptions, {
    businessUnit: businessUnitId,
    tab: subscriptionSelectedTab,
  });

  const mySubscriptionRoute = pathToUrl(Paths.SubscriptionModule.MySubscriptions, {
    businessUnit: businessUnitId,
    tab: subscriptionSelectedTab,
  });

  const subscriptionOrdersRoute = pathToUrl(Paths.SubscriptionModule.SubscriptionOrders, {
    businessUnit: businessUnitId,
    tab: SubscriptionOrderTabRoutes.scheduled,
  });

  const batchStatementsUrl = pathToUrl(Paths.BillingModule.BatchStatements, {
    businessUnit: businessUnitId,
    subPath: undefined,
    id: undefined,
  });

  return (
    <NavigationPanel>
      <Layouts.Margin left="3" right="3">
        {businessUnit?.type !== BusinessUnitType.RECYCLING_FACILITY ? (
          <Protected permissions="customers:view:perform">
            <Protected permissions="orders:new-order:perform">
              <Button
                iconLeft={CirclePlusIcon}
                size="medium"
                variant="primary"
                full
                to={pathToUrl(Paths.RequestModule.Request, {
                  businessUnit: businessUnitId,
                })}
                onClick={handlePlaceNewOrderSubmit}
              >
                {t(`${I18N_PATH}CreateNew`)}
              </Button>
            </Protected>
          </Protected>
        ) : (
          <Protected permissions="recycling:YardConsole:perform">
            <Layouts.Margin top="1">
              <RecycleIconLayout>
                <Button
                  iconLeft={RecyclingIcon}
                  size="medium"
                  variant="success"
                  full
                  onClick={handleYardOperationsClick}
                >
                  {t(`${I18N_PATH}YardOperations`)}
                </Button>
              </RecycleIconLayout>
            </Layouts.Margin>
          </Protected>
        )}
      </Layouts.Margin>
      {!isRecyclingFacilityBU ? (
        <>
          <Layouts.Padding top="2" />
          <NavigationPanelItem
            exact
            icon={RequestsIcon}
            badge={resolveCountExceed(orderRequestStore.count?.total, LIMIT)}
            to={orderRequestsUrl}
          >
            {t(`${I18N_PATH}OrderRequests`)}
          </NavigationPanelItem>
          <Layouts.Padding top="2" />
          <NavigationPanelItem
            exact
            icon={ChatsIcon}
            badge={resolveCountExceed(chatStore.counts?.total, LIMIT)}
            to={chatsRequestsUrl}
          >
            {t(`${I18N_PATH}Chats`)}
          </NavigationPanelItem>
        </>
      ) : null}
      <NavigationPanelItem
        title={t(
          `${I18N_PATH}${isCore || isRecyclingFacilityBU ? 'Orders' : 'OrdersAndSubscriptions'}`,
        )}
        icon={OrdersIcon}
        active={!!orderStore.allCounts}
      >
        <NavigationPanelItem
          inner
          exact={false}
          badge={resolveCountExceed(orderStore.allCounts?.total, LIMIT)}
          to={ordersUrl}
          isActive={handleIsOrderActive}
        >
          {t(`${I18N_PATH}Orders`)}
        </NavigationPanelItem>
        <NavigationPanelItem
          inner
          exact={false}
          badge={resolveCountExceed(orderStore.myCounts?.total, LIMIT)}
          to={myOrdersUrl}
          isActive={handleIsMyOrderActive}
        >
          {t(`${I18N_PATH}OnlyMyOrders`)}
        </NavigationPanelItem>
        {!(isCore || isRecyclingFacilityBU) ? (
          <>
            <NavigationPanelItem
              inner
              exact={false}
              badge={resolveCountExceed(subscriptionStore.allCounts?.total ?? 0, LIMIT)}
              to={subscriptionRoute}
              isActive={handleIsSubscriptionsActive}
            >
              {t(`${I18N_PATH}Subscriptions`)}
            </NavigationPanelItem>
            <NavigationPanelItem
              inner
              exact={false}
              badge={resolveCountExceed(subscriptionStore.myCounts?.total ?? 0, LIMIT)}
              to={mySubscriptionRoute}
              isActive={handleIsMySubscriptionsActive}
            >
              {t(`${I18N_PATH}MyRecentSubscriptions`)}
            </NavigationPanelItem>
            <NavigationPanelItem
              inner
              exact={false}
              badge={resolveCountExceed(subscriptionOrderStore.getCounts()?.total ?? 0, LIMIT)}
              to={subscriptionOrdersRoute}
              isActive={handleIsSubscriptionOrdersActive}
            >
              {t(`${I18N_PATH}SubscriptionOrders`)}
            </NavigationPanelItem>
          </>
        ) : null}
      </NavigationPanelItem>

      <NavigationPanelItem
        title={t(`${I18N_PATH}Customers`)}
        icon={CustomersIcon}
        active={!!customerStore.counts}
      >
        {customerStore.counts ? (
          getCustomerNavigationTabs(
            businessUnitId,
            !!isRecyclingFacilityBU,
            customerStore.counts,
            customerGroupStore,
          ).map(({ count, index, to, label }) => (
            <NavigationPanelItem inner badge={resolveCountExceed(count, LIMIT)} key={index} to={to}>
              {label}
            </NavigationPanelItem>
          ))
        ) : (
          <NavigationPanelItem
            inner
            badge="0"
            key="all"
            to={pathToUrl(Paths.CustomersModule.Customers, {
              businessUnit: businessUnitId,
              customerGroupId: 'all',
            })}
          >
            {t(`${I18N_PATH}AllCustomers`)}
          </NavigationPanelItem>
        )}
      </NavigationPanelItem>

      <NavigationPanelItem
        title={t(`${I18N_PATH}JobSites`)}
        icon={DisposalSitesIcon}
        active={!!jobSiteStore.counts}
      >
        <NavigationPanelItem
          inner
          exact={false}
          badge={resolveCountExceed(jobSiteStore?.counts?.total, LIMIT)}
          to={pathToUrl(Paths.JobSitesModule.JobSites, {
            businessUnit: businessUnitId,
          })}
        >
          {t(`${I18N_PATH}AllJobSites`)}
        </NavigationPanelItem>
      </NavigationPanelItem>

      {!isRecyclingFacilityBU && (!isCore || enableRecyclingFeatures) ? (
        <NavigationPanelItem
          title={t(`${I18N_PATH}LandfillOperations`)}
          icon={DisposalSitesIcon}
          active={!!landfillOperationStore.counts}
        >
          <NavigationPanelItem
            inner
            exact={false}
            badge={resolveCountExceed(landfillOperationStore?.counts?.total, LIMIT)}
            to={pathToUrl(Paths.LandfillOperationsModule.LandfillOperations, {
              businessUnit: businessUnitId,
            })}
          >
            {t(`${I18N_PATH}AllOperations`)}
          </NavigationPanelItem>
        </NavigationPanelItem>
      ) : null}

      <NavigationPanelItem title={t(`${I18N_PATH}Billing`)} icon={BillingIcon} active>
        <NavigationPanelItem inner to={invoiceUrl} exact={false}>
          {t(`${I18N_PATH}Invoices`)}
        </NavigationPanelItem>
        <NavigationPanelItem inner to={bankDepositsUrl} exact={false}>
          {t(`${I18N_PATH}BankDeposits`)}
        </NavigationPanelItem>
        <NavigationPanelItem inner to={deferredPaymentsUrl} exact={false}>
          {t(`${I18N_PATH}DeferredPayments`)}
        </NavigationPanelItem>
        <NavigationPanelItem
          inner
          to={paymentsAndPayoutsUrl}
          exact={false}
          badge={resolveCountExceed(undefined, LIMIT)}
        >
          {t(`${I18N_PATH}PaymentsPayouts`)}
        </NavigationPanelItem>
        <NavigationPanelItem
          inner
          to={batchStatementsUrl}
          badge={resolveCountExceed(undefined, LIMIT)}
          exact={false}
        >
          {t(`${I18N_PATH}BatchStatements`)}
        </NavigationPanelItem>
        <NavigationPanelItem
          inner
          to={pathToUrl(Paths.BillingModule.Settlements, {
            businessUnit: businessUnitId,
          })}
          exact={false}
        >
          {t(`${I18N_PATH}CreditCardSettlements`)}
        </NavigationPanelItem>
      </NavigationPanelItem>

      <NavigationPanelItem icon={ReportsIcon} to={reportsUrl} exact isActive={handleIsReportActive}>
        {t(`${I18N_PATH}Reports`)}
      </NavigationPanelItem>
      {!(isCore || isRecyclingFacilityBU) ? (
        <NavigationPanelItem
          icon={DispatcherIcon}
          to={`${process.env
            .ROUTE_PLANNER_FE_URL!}/business-units/${businessUnitId}/dispatch/dashboard`}
          external
        >
          {t(`${I18N_PATH}Dispatcher`)}
        </NavigationPanelItem>
      ) : null}
    </NavigationPanel>
  );
};

export default observer(BusinessUnitNavigationPanel);
