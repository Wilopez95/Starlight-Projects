import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { matchPath } from 'react-router-dom';
import {
  BillingIcon,
  Button,
  CirclePlusIcon,
  CustomersIcon,
  DispatcherIcon,
  DisposalSitesIcon,
  Layouts,
  NavigationPanel,
  NavigationPanelItem,
  NavigationPanelItemContainer,
  OrdersIcon,
  ReportsIcon,
  RequestsIcon,
} from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  OrderStatusRoutes,
  Paths,
  RouteModules,
  Routes,
  SubscriptionTabRoutes,
} from '@root/consts';
import { getCustomerNavigationTabs, pathToUrl, resolveCountExceed } from '@root/helpers';
import { getHaulingRedirectUrl } from '@root/helpers/getHaulingRedirectUrl';
import { useBusinessContext, useStores } from '@hooks';

const LIMIT = 9999;
const I18N_PATH = 'components.PageLayouts.BusinessUnitLayout.NavigationPanel.Text.';

const BusinessUnitNavigationPanel: React.FC = () => {
  const {
    orderStore,
    commonStore,
    customerStore,
    customerGroupStore,
    jobSiteStore,
    subscriptionStore,
    subscriptionDraftStore,
    orderRequestStore,
  } = useStores();

  // TODO figure out what this is here for
  const accountsReceivable = undefined;
  const paymentsAndRefunds = undefined;

  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  useEffect(() => {
    commonStore.requestNavigationCounts(businessUnitId);
  }, [commonStore, businessUnitId]);

  const handlePlaceNewOrderSubmit = useCallback(() => {
    /* trigger redirect here */
  }, []);

  const getRedirectUrl = useMemo(() => getHaulingRedirectUrl(window.location.hostname), []);

  const orderRequestsUrl = getRedirectUrl(
    pathToUrl(Paths.OrderModule.OrderRequests, {
      businessUnit: businessUnitId,
    }),
  );

  const ordersUrl = getRedirectUrl(
    pathToUrl(Paths.OrderModule.Orders, {
      businessUnit: businessUnitId,
      subPath: OrderStatusRoutes.InProgress,
    }),
  );

  const myOrdersUrl = getRedirectUrl(
    pathToUrl(Paths.OrderModule.MyOrders, {
      businessUnit: businessUnitId,
      subPath: OrderStatusRoutes.InProgress,
    }),
  );

  const invoiceUrl = getRedirectUrl(
    pathToUrl(Paths.BillingModule.Invoices, {
      businessUnit: businessUnitId,
      subPath: undefined,
      id: undefined,
    }),
  );

  const systemReportsUrl = getRedirectUrl(
    pathToUrl(Paths.ReportsModule.Reports, {
      businessUnit: businessUnitId,
      subPath: Routes.Operational,
    }),
  );

  const bankDepositsUrl = getRedirectUrl(
    pathToUrl(Paths.BillingModule.BankDeposits, {
      businessUnit: businessUnitId,
      subPath: undefined,
      id: undefined,
    }),
  );

  const deferredPaymentsUrl = getRedirectUrl(
    pathToUrl(Paths.BillingModule.DeferredPayments, {
      businessUnit: businessUnitId,
      id: undefined,
    }),
  );

  const paymentsAndPayoutsUrl = getRedirectUrl(
    pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
      businessUnit: businessUnitId,
      subPath: undefined,
      id: undefined,
    }),
  );

  const subscriptionRoute = getRedirectUrl(
    pathToUrl(Paths.SubscriptionModule.Subscriptions, {
      businessUnit: businessUnitId,
      tab: SubscriptionTabRoutes.Active,
    }),
  );

  const mySubscriptionRoute = getRedirectUrl(
    pathToUrl(Paths.SubscriptionModule.MySubscriptions, {
      businessUnit: businessUnitId,
      tab: SubscriptionTabRoutes.Active,
    }),
  );

  const allCustomersUrl = getRedirectUrl(
    pathToUrl(Paths.CustomersModule.Customers, {
      businessUnit: businessUnitId,
      customerGroupId: 'all',
    }),
  );

  const newOrderUrl = getRedirectUrl(
    pathToUrl(Paths.RequestModule.Request, {
      businessUnit: businessUnitId,
    }),
  );

  const allJobSites = getRedirectUrl(
    pathToUrl(Paths.JobSitesModule.JobSites, {
      businessUnit: businessUnitId,
    }),
  );

  const batchStatementsUrl = getRedirectUrl(
    pathToUrl(Paths.BillingModule.BatchStatements, {
      businessUnit: businessUnitId,
      subPath: undefined,
      id: undefined,
    }),
  );

  const creditCardsSettlements = getRedirectUrl(
    pathToUrl(Paths.BillingModule.Settlements, {
      businessUnit: businessUnitId,
    }),
  );

  const handleIsDispatcherActive = useCallback((_, location: { pathname: string }): boolean => {
    return !!matchPath(location.pathname, {
      path: RouteModules.Dispatch,
      exact: false,
    });
  }, []);

  return (
    <NavigationPanel>
      <Layouts.Margin left="3" right="3">
        <Button
          iconLeft={CirclePlusIcon}
          size="medium"
          variant="primary"
          full
          to={newOrderUrl}
          onClick={handlePlaceNewOrderSubmit}
        >
          {t(`${I18N_PATH}CreateNew`)}
        </Button>
      </Layouts.Margin>
      <Layouts.Margin top="2">
        <NavigationPanelItem
          exact
          icon={RequestsIcon}
          badge={resolveCountExceed(orderRequestStore.count?.total, LIMIT)}
          to={orderRequestsUrl}
          external
        >
          Order Requests
        </NavigationPanelItem>
      </Layouts.Margin>
      <NavigationPanelItemContainer>
        <NavigationPanelItem
          title={t(`${I18N_PATH}OrdersAndSubscriptions`)}
          icon={OrdersIcon}
          active={!!orderStore.allCounts}
        >
          <NavigationPanelItem
            inner
            exact={false}
            badge={resolveCountExceed(orderStore.allCounts?.total, LIMIT)}
            to={ordersUrl}
            external
          >
            {t(`${I18N_PATH}Orders`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            exact={false}
            badge={resolveCountExceed(orderStore.myCounts?.total, LIMIT)}
            to={myOrdersUrl}
            external
          >
            {t(`${I18N_PATH}OnlyMyOrders`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            exact={false}
            badge={resolveCountExceed(
              (subscriptionStore.allCounts?.total ?? 0) +
                (subscriptionDraftStore.allCounts?.total ?? 0),
              LIMIT,
            )}
            to={subscriptionRoute}
            external
          >
            {t(`${I18N_PATH}Subscriptions`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            exact={false}
            badge={resolveCountExceed(
              (subscriptionStore.myCounts?.total ?? 0) +
                (subscriptionDraftStore.myCounts?.total ?? 0),
              LIMIT,
            )}
            to={mySubscriptionRoute}
            external
          >
            {t(`${I18N_PATH}MyRecentSubscriptions`)}
          </NavigationPanelItem>
        </NavigationPanelItem>
        <NavigationPanelItem
          title={t(`${I18N_PATH}Customers`)}
          icon={CustomersIcon}
          active={!!customerStore.counts}
        >
          {customerStore.counts ? (
            getCustomerNavigationTabs(businessUnitId, customerStore.counts, customerGroupStore).map(
              ({ count, index, to, label }) => (
                <NavigationPanelItem
                  inner
                  badge={resolveCountExceed(count, LIMIT)}
                  key={index}
                  to={to}
                  external
                >
                  {label}
                </NavigationPanelItem>
              ),
            )
          ) : (
            <NavigationPanelItem inner badge={0} key="all" to={allCustomersUrl} external>
              {t(`${I18N_PATH}AllCustomers`)}
            </NavigationPanelItem>
          )}
        </NavigationPanelItem>
        <NavigationPanelItem
          title="Job Sites"
          icon={DisposalSitesIcon}
          active={!!jobSiteStore.counts}
        >
          <NavigationPanelItem
            inner
            exact={false}
            external
            badge={resolveCountExceed(jobSiteStore.counts?.total, LIMIT)}
            to={allJobSites}
          >
            All Job Sites
          </NavigationPanelItem>
        </NavigationPanelItem>
        <NavigationPanelItem title={t(`${I18N_PATH}Billing`)} icon={BillingIcon} active>
          <NavigationPanelItem inner to={invoiceUrl} exact={false} external>
            {t(`${I18N_PATH}Invoices`)}
          </NavigationPanelItem>
          <NavigationPanelItem inner to={bankDepositsUrl} exact={false} external>
            Bank Deposits
          </NavigationPanelItem>
          <NavigationPanelItem inner to={deferredPaymentsUrl} exact={false} external>
            {t(`${I18N_PATH}DeferredPayments`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            badge={resolveCountExceed(accountsReceivable, LIMIT)}
            //exact={false} Uncomment when create this page
            external
          >
            {t(`${I18N_PATH}AccountsReceivable`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            to={paymentsAndPayoutsUrl}
            exact={false}
            badge={resolveCountExceed(paymentsAndRefunds, LIMIT)}
            external
          >
            {t(`${I18N_PATH}PaymentsPayouts`)}
          </NavigationPanelItem>
          <NavigationPanelItem
            inner
            to={batchStatementsUrl}
            badge={resolveCountExceed(undefined, LIMIT)}
            exact={false}
            external
          >
            {t(`${I18N_PATH}BatchStatements`)}
          </NavigationPanelItem>
          <NavigationPanelItem inner to={creditCardsSettlements} exact={false} external>
            {t(`${I18N_PATH}CreditCardSettlements`)}
          </NavigationPanelItem>
        </NavigationPanelItem>
        <NavigationPanelItem title={t(`${I18N_PATH}Reports`)} icon={ReportsIcon} active>
          <NavigationPanelItem inner to={systemReportsUrl} exact={false} external>
            {t(`${I18N_PATH}SystemReports`)}
          </NavigationPanelItem>
        </NavigationPanelItem>
        <NavigationPanelItem
          isActive={handleIsDispatcherActive}
          icon={DispatcherIcon}
          title={t(`${I18N_PATH}Dispatcher`)}
          to={pathToUrl(RouteModules.Dispatch, {
            businessUnit: businessUnitId,
          })}
        />
      </NavigationPanelItemContainer>
    </NavigationPanel>
  );
};

export default observer(BusinessUnitNavigationPanel);
