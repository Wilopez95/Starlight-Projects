import React from 'react';
import { Route, Switch } from 'react-router';

import { PageHeader } from '@root/app/components';
import { DefaultAuthenticatedRedirect } from '@root/app/container/DefaultAuthenticatedRoute';
import { namespace, userHasPermission } from '@root/auth/hooks';
import { Action } from '@root/auth/hooks/permission/types';
import { BasePage } from '@root/core/common';
import { useUserContext } from '@root/core/hooks';
import { IRoute } from '@root/core/types';
import { CustomerCreditCardsConfig } from '@root/customer/pages/CustomerCreditCards/config';
import { OrdersPageConfig as InvocesOrdersPageConfig } from '@root/customer/pages/Invoices/config';
import { ProfilePageConfig } from '@root/customer/pages/Profile/config';
import { ReportsConfig } from '@root/customer/pages/Reports/config';
import { StatementsConfig } from '@root/customer/pages/Statements/config';
import { SubscriptionPageConfig } from '@root/customer/pages/Subscriptions/config';
import { UserContactsConfig } from '@root/customer/pages/UserContacts/config';

import CustomerBasePage from './layouts/CustomerBasePage';

export const customerRoutes: IRoute[] = [
  ProfilePageConfig,
  CustomerCreditCardsConfig,
  UserContactsConfig,
  StatementsConfig,
  InvocesOrdersPageConfig,
  SubscriptionPageConfig,
  ReportsConfig,
];

const getPageHeader = (Header?: string | React.FC | boolean) => {
  switch (typeof Header) {
    case 'boolean': {
      return PageHeader;
    }
    case 'string': {
      return () => <PageHeader>{Header}</PageHeader>;
    }
    case 'function':
    case 'object': {
      return Header;
    }
    default: {
      return PageHeader;
    }
  }
};

const Routes: React.FC<{ routeList: IRoute[] }> = ({ routeList }) => {
  const { currentUser } = useUserContext();

  return (
    <Switch>
      {routeList.map(({ Component: Component, exact = true, header = true, path, entity }) => {
        const canView = userHasPermission(currentUser!, [`${namespace}:${entity!}:${Action.List}`]);

        return canView ? (
          <Route key={path} path={path} exact={exact}>
            <CustomerBasePage>
              {header ? (
                <BasePage component={Component} header={getPageHeader(header)} />
              ) : (
                <Component />
              )}
            </CustomerBasePage>
          </Route>
        ) : null;
      })}
      <Route path='*'>
        <DefaultAuthenticatedRedirect />
      </Route>
    </Switch>
  );
};

export const CustomerModuleRoutes = () => <Routes routeList={customerRoutes} />;
