import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Route, Switch } from 'react-router-dom';
import { Layouts } from '@starlightpro/shared-components';

import { Paths, RouteModules } from '@root/consts';
import { isCore } from '@root/consts/env';
import { useStores } from '@root/hooks';

import { CustomerNavigation } from '../Customer';
import CustomerInvoicesDetails from '../CustomerInvoicesDetails/CustomerInvoicesDetails';
import CustomerRecurrentOrders from '../CustomerRecurrentOrders/CustomerRecurrentOrders';
import CustomerSubscriptionDetailsPage from '../CustomerSubscriptionDetails/CustomerSubscriptionDetails';
import CustomerSubscriptionHistoryPage from '../CustomerSubscriptionHistory/CustomerSubscriptionHistory';
import CustomerSubscriptionMediaPage from '../CustomerSubscriptionMedia/CustomerSubscriptionMedia';
import CustomerSubscriptionOrdersPage from '../CustomerSubscriptionOrders/CustomerSubscriptionOrders';
import CustomerSubscriptions from '../CustomerSubscriptions/CustomerSubscriptions';

import SideBar from './components/SideBar/SideBar';

export const CustomerOrdersAndSubscriptionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { customerStore } = useStores();
  const customer = customerStore.selectedEntity;

  return (
    <>
      <Helmet
        title={t(isCore ? 'Titles.CustomerOrders' : 'Titles.CustomerOrdersAndSubscriptions', {
          customerName: customer?.name ?? '',
        })}
      />
      <CustomerNavigation />
      <Layouts.Flex as={Layouts.Box} width="100%" height="100%" overflowHidden>
        <SideBar />
        <Switch>
          <Route path={RouteModules.CustomerRecurrentOrders}>
            <CustomerRecurrentOrders />
          </Route>
          {!isCore ? (
            <>
              {/** TODO move in CustomerSubscriptions*/}
              <Route path={Paths.CustomerSubscriptionModule.Orders}>
                <CustomerSubscriptionOrdersPage />
              </Route>
              {/** TODO move in CustomerSubscriptions*/}
              <Route path={Paths.CustomerSubscriptionModule.Details}>
                <CustomerSubscriptionDetailsPage />
              </Route>
              <Route path={Paths.CustomerSubscriptionModule.History}>
                <CustomerSubscriptionHistoryPage />
              </Route>
              {/** TODO move in CustomerSubscriptions*/}
              <Route path={Paths.CustomerSubscriptionModule.Media}>
                <CustomerSubscriptionMediaPage />
              </Route>
              <Route path={Paths.CustomerSubscriptionModule.Invoices}>
                <CustomerInvoicesDetails />
              </Route>
              <Route path={RouteModules.CustomerSubscriptions} exact>
                <CustomerSubscriptions />
              </Route>
            </>
          ) : null}
        </Switch>
      </Layouts.Flex>
    </>
  );
};
