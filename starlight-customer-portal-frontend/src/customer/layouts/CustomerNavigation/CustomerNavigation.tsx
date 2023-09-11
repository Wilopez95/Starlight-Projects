import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { useEntityPermission } from '@root/auth/hooks';
import { Action } from '@root/auth/hooks/permission/types';
import type { RoutingNavigationItem } from '@root/core/common/RoutingNavigation/types';
import { TableNavigationHeader } from '@root/core/common/TableTools';
import { Paths } from '@root/core/consts';
import { pathToUrl } from '@root/core/helpers';
import { useSubscriptionSelectedTab } from '@root/core/hooks';
import { ITabsNavigation } from '@root/customer/layouts/types';

const CustomerNavigation: React.ForwardRefRenderFunction<HTMLDivElement, ITabsNavigation> = (
  { onSearch, searchPlaceholder },
  ref,
) => {
  const { t } = useTranslation();
  const I18N_PATH = 'components.PageLayouts.CustomerLayout.CustomerNavigation.Text.';
  const { customerId } = useParams<{ customerId: string }>();
  const canFetchUsers = useEntityPermission('contacts', Action.List);
  const canFetchReports = useEntityPermission('reports', Action.List);
  const selectedTab = useSubscriptionSelectedTab();

  const routes: RoutingNavigationItem[] = [
    {
      content: t(`${I18N_PATH}Profile`),
      to: pathToUrl(Paths.Profile, {
        customerId: customerId,
      }),
    },
    {
      content: t(`${I18N_PATH}Subscriptions`),
      to: pathToUrl(Paths.Subscriptions, {
        customerId: customerId,
        tab: selectedTab,
      }),
    },
    {
      content: t(`${I18N_PATH}CreditCards`),
      to: pathToUrl(Paths.CustomerCreditCards, {
        customerId: customerId,
      }),
    },
    {
      content: t(`${I18N_PATH}Invoices`),
      to: pathToUrl(Paths.Invoices, {
        customerId: customerId,
        id: undefined,
      }),
    },
    {
      content: t(`${I18N_PATH}Statements`),
      to: pathToUrl(Paths.Statements, {
        customerId: customerId,
      }),
    },
  ];

  if (canFetchUsers) {
    routes.push({
      content: t(`${I18N_PATH}Users`),
      to: pathToUrl(Paths.Users, {
        customerId: customerId,
      }),
    });
  }
  if (canFetchReports) {
    routes.push({
      content: t(`${I18N_PATH}Reports`),
      to: pathToUrl(Paths.Reports, {
        customerId: customerId,
      }),
    });
  }

  return (
    <TableNavigationHeader
      onSearch={onSearch}
      placeholder={searchPlaceholder}
      routes={routes}
      navigationRef={ref as React.MutableRefObject<HTMLDivElement | null>}
    />
  );
};

export default observer(CustomerNavigation, {
  forwardRef: true,
});
