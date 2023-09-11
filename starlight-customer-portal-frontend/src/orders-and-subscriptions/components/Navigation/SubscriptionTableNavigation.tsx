import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableNavigationHeader } from '@root/core/common/TableTools';
import { Paths, SubscriptionTabRoutes } from '@root/core/consts';
import { pathToUrl } from '@root/core/helpers';
import { useStores } from '@root/core/hooks';
import { SubscriptionStatusEnum } from '@root/core/types';

import { CustomerSubscriptionsParams } from '../../types';

import { ISubscriptionTableNavigation } from './types';

const CustomerSubscriptionTableNavigation: React.FC<ISubscriptionTableNavigation> = () => {
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const { customerId, tab } = useParams<CustomerSubscriptionsParams>();
  const isDraftTab = tab === SubscriptionTabRoutes.Draft;
  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;

  const routes = [
    {
      content: `Draft ・ ${subscriptionDraftStore.allCounts}`,
      to: pathToUrl(Paths.Subscriptions, {
        customerId: customerId,
        tab: SubscriptionTabRoutes.Draft,
      }),
    },
    {
      content: `Active ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.Active,
      )}`,
      to: pathToUrl(Paths.Subscriptions, {
        customerId: customerId,
        tab: SubscriptionTabRoutes.Active,
      }),
    },
    {
      content: `On Hold ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.OnHold,
      )}`,
      to: pathToUrl(Paths.Subscriptions, {
        customerId: customerId,
        tab: SubscriptionTabRoutes.OnHold,
      }),
    },
    {
      content: `Closed ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.Closed,
      )}`,
      to: pathToUrl(Paths.Subscriptions, {
        customerId: customerId,
        tab: SubscriptionTabRoutes.Closed,
      }),
    },
  ];

  const handleSearch = useCallback(
    (search: string) => {
      store.requestSearch(search, { customerId });
    },
    [store, customerId],
  );

  return (
    <TableNavigationHeader
      routes={routes}
      placeholder='Search Subscriptions'
      onSearch={handleSearch}
      numericOnly
    />
  );
};

export default observer(CustomerSubscriptionTableNavigation);
