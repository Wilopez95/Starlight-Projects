import React, { useEffect, useMemo } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { RoutingNavigation } from '@root/common';
import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { isCore } from '@root/consts/env';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { CustomerOrdersAndSubscriptionsParams } from '@root/pages/CustomerOrdersAndSubscriptions/types';

import { useNavigation } from '../../hooks';
import SideBarItem from '../SideBarItem/SideBarItem';

const loadingConfig: RoutingNavigationItem[] = range(2).map(item => ({
  loading: true,
  content: item,
  width: '90%',
}));

const SideBar: React.FC = () => {
  const { subscriptionStore, subscriptionDraftStore, recurrentOrderStore } = useStores();

  const history = useHistory();

  const { businessUnitId } = useBusinessContext();
  const { customerId } = useParams<CustomerOrdersAndSubscriptionsParams>();
  const subscriptionsMatch = useRouteMatch<CustomerOrdersAndSubscriptionsParams>({
    path: Paths.CustomerSubscriptionModule.Subscriptions,
  });
  const recurrentOrdersMatch = useRouteMatch({ path: Paths.CustomerRecurrentOrderModule.Orders });

  const tab = subscriptionsMatch?.params?.tab;

  const loading = useMemo(() => {
    if (subscriptionsMatch && tab) {
      return tab === SubscriptionTabRoutes.Draft
        ? subscriptionDraftStore.loading
        : subscriptionStore.loading;
    }

    return recurrentOrderStore.loading;
  }, [
    subscriptionsMatch,
    tab,
    recurrentOrderStore.loading,
    subscriptionDraftStore.loading,
    subscriptionStore.loading,
  ]);

  useEffect(() => {
    if (customerId) {
      subscriptionDraftStore.requestCustomerCount({ businessUnitId, customerId });
      subscriptionStore.requestCustomerCount({ businessUnitId, customerId });
      recurrentOrderStore.requestCount(+customerId);
    }
  }, [subscriptionStore, businessUnitId, customerId, subscriptionDraftStore, recurrentOrderStore]);

  useEffect(() => {
    if (customerId && !recurrentOrdersMatch && !tab) {
      const url = pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
        businessUnit: businessUnitId,
        customerId,
        tab: SubscriptionTabRoutes.Active,
      });

      history.push(url);
    } else if (isCore && customerId && !recurrentOrdersMatch) {
      const url = pathToUrl(Paths.CustomerRecurrentOrderModule.Orders, {
        businessUnit: businessUnitId,
        customerId,
      });

      history.push(url);
    }
  }, [
    subscriptionStore,
    businessUnitId,
    customerId,
    subscriptionDraftStore,
    recurrentOrderStore,
    tab,
    history,
    recurrentOrdersMatch,
  ]);

  const counts = useMemo(
    () => ({
      subscription: subscriptionStore.allCustomerCounts?.total ?? 0,
      recurrent: recurrentOrderStore.count ?? 0,
    }),
    [recurrentOrderStore.count, subscriptionStore.allCustomerCounts?.total],
  );
  const configs = useNavigation(counts);

  const routes: RoutingNavigationItem[] = !loading
    ? configs.map(navigation => ({
        content: <SideBarItem title={navigation.title} subtitle={navigation.subtitle} />,
        to: navigation.path,
      }))
    : loadingConfig;

  return (
    <Layouts.Box minWidth="250px" width="250px" position="sticky" top="0">
      <RoutingNavigation routes={routes} direction="column" />
    </Layouts.Box>
  );
};

export default observer(SideBar);
