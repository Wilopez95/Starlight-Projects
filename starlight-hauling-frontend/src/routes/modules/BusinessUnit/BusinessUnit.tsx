import React from 'react';
import { Route, Switch } from 'react-router';

import { BusinessUnitLayout } from '@root/components/PageLayouts';
import { Paths, RouteModules } from '@root/consts';
import { enableRecyclingFeatures, isCore } from '@root/consts/env';
import BankDepositsPage from '@root/modules/billing/BankDeposits/pages/BankDepositsPage';
import BatchStatementsPage from '@root/modules/billing/BatchStatements/pages/BatchStatements';
import DeferredPaymentsPage from '@root/modules/billing/DeferredPayments/pages/DeferredPayments';
import InvoicesPage from '@root/modules/billing/pages/InvoicesAndFinCharges/InvoicesPage';
import PaymentsAndPayoutsPage from '@root/modules/billing/pages/PaymentsAndPayouts/PaymentsAndPayouts';
import SettlementsPage from '@root/modules/billing/Settlements/pages/Settlements/SettlementsPage';
import ChatsPage from '@root/pages/Chats/ChatsPage';
import CustomerPage from '@root/pages/Customer/Customer';
import CustomersPage from '@root/pages/Customers/CustomersPage';
import JobSitesPage from '@root/pages/JobSites/JobSitesPage';
import LandfillOperationsPage from '@root/pages/LandfillOperations/LandfillOperationsPage';
import { MySubscriptionsPage } from '@root/pages/MySubscriptions/MySubscriptions';
import OrderRequestsPage from '@root/pages/OrderRequests/OrderRequests';
import { OrdersPage } from '@root/pages/Orders/Orders';
import { SubscriptionOrdersPage } from '@root/pages/SubscriptionOrders/SubscriptionOrders';
import { SubscriptionsPage } from '@root/pages/Subscriptions/Subscriptions';
import { DefaultAuthenticatedRedirect } from '@root/routes/DefaultAuthenticatedRoute';
import { useIsRecyclingFacilityBU } from '@hooks';

export const BusinessUnit: React.FC = () => {
  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  return (
    <BusinessUnitLayout>
      <Switch>
        {!isRecyclingFacilityBU
          ? [
              <Route
                path={Paths.OrderModule.OrderRequests}
                key={Paths.OrderModule.OrderRequests}
                exact
              >
                <OrderRequestsPage />
              </Route>,
              <Route path={Paths.Chats} key={Paths.Chats} exact>
                <ChatsPage />
              </Route>,
            ]
          : null}
        <Route path={Paths.OrderModule.Orders} exact>
          <OrdersPage />
        </Route>
        <Route path={Paths.OrderModule.MyOrders} exact>
          <OrdersPage my />
        </Route>
        {!isRecyclingFacilityBU
          ? [
              <Route
                path={Paths.SubscriptionModule.Subscriptions}
                key={Paths.SubscriptionModule.Subscriptions}
                exact
              >
                <SubscriptionsPage />
              </Route>,
              <Route
                path={Paths.SubscriptionModule.MySubscriptions}
                key={Paths.SubscriptionModule.MySubscriptions}
                exact
              >
                <MySubscriptionsPage />
              </Route>,
              <Route
                path={Paths.SubscriptionModule.SubscriptionOrders}
                key={Paths.SubscriptionModule.SubscriptionOrders}
                exact
              >
                <SubscriptionOrdersPage />
              </Route>,
            ]
          : null}
        <Route path={Paths.CustomersModule.Customers} exact>
          <CustomersPage />
        </Route>
        <Route path={RouteModules.Customer}>
          <CustomerPage />
        </Route>
        <Route path={Paths.JobSitesModule.JobSites} exact>
          <JobSitesPage />
        </Route>
        {!isRecyclingFacilityBU && (!isCore || enableRecyclingFeatures) ? (
          <Route path={Paths.LandfillOperationsModule.LandfillOperations} exact>
            <LandfillOperationsPage />
          </Route>
        ) : null}
        <Route path={Paths.BillingModule.Invoices} exact>
          <InvoicesPage />
        </Route>
        <Route path={Paths.BillingModule.BankDeposits} exact>
          <BankDepositsPage />
        </Route>
        <Route path={Paths.BillingModule.DeferredPayments} exact>
          <DeferredPaymentsPage />
        </Route>
        <Route path={Paths.BillingModule.PaymentsAndPayouts} exact>
          <PaymentsAndPayoutsPage />
        </Route>
        <Route path={Paths.BillingModule.BatchStatements} exact>
          <BatchStatementsPage />
        </Route>
        <Route path={Paths.BillingModule.Settlements} exact>
          <SettlementsPage />
        </Route>

        <Route path="*">
          <DefaultAuthenticatedRedirect />
        </Route>
      </Switch>
    </BusinessUnitLayout>
  );
};
