import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { TableNavigationHeaderProps } from '@root/common/TableTools/TableNavigationHeader/types';
import { SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useSubscriptionSelectedTab } from '@hooks';

import { CustomerSubscriptionParams } from '../../types';

import { SubscriptionDraftNavigationRoutes, SubscriptionNavigationRoutes } from './consts';

const CustomerSubscriptionNavigation: React.ForwardRefRenderFunction<
  HTMLDivElement,
  Omit<TableNavigationHeaderProps, 'routes'>
> = (props, ref) => {
  const { subscriptionId, customerId, subscriptionOrderId } =
    useParams<CustomerSubscriptionParams>();
  const selectedTab = useSubscriptionSelectedTab();
  const { businessUnitId } = useBusinessContext();
  const isDraftTab = selectedTab === SubscriptionTabRoutes.Draft;
  const { t } = useTranslation();

  const routes = useMemo(() => {
    const navigationRoutes = isDraftTab
      ? SubscriptionDraftNavigationRoutes
      : SubscriptionNavigationRoutes;

    return navigationRoutes.map(({ to, ...route }) => ({
      ...route,
      content: t(route.content),
      to: pathToUrl(to, {
        businessUnit: businessUnitId,
        customerId,
        subscriptionId,
        tab: selectedTab,
        subscriptionOrderId,
      }),
    }));
  }, [t, businessUnitId, customerId, selectedTab, subscriptionId, subscriptionOrderId, isDraftTab]);

  return (
    <TableTools.HeaderNavigation
      routes={routes}
      navigationRef={ref as React.MutableRefObject<HTMLDivElement | null>}
      {...props}
    />
  );
};

export default observer(CustomerSubscriptionNavigation, {
  forwardRef: true,
});
