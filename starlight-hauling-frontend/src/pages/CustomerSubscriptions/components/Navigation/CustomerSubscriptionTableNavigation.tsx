import React, { useCallback } from 'react';
import { useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { SubscriptionStatusEnum } from '@root/types';
import { useBusinessContext, useStores } from '@hooks';

import { CustomerSubscriptionsParams } from '../../types';

const CustomerSubscriptionTableNavigation: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { subscriptionStore, subscriptionDraftStore } = useStores();
  const { customerId, tab } = useParams<CustomerSubscriptionsParams>();
  const isDraftTab = tab === SubscriptionTabRoutes.Draft;
  const store = isDraftTab ? subscriptionDraftStore : subscriptionStore;

  const routes = [
    {
      content: `Draft ・ ${subscriptionDraftStore.customerCount}`,
      to: pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
        businessUnit: businessUnitId,
        customerId,
        tab: SubscriptionTabRoutes.Draft,
      }),
    },
    {
      content: `Active ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.Active,
      )}`,
      to: pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
        businessUnit: businessUnitId,
        customerId,
        tab: SubscriptionTabRoutes.Active,
      }),
    },
    {
      content: `On Hold ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.OnHold,
      )}`,
      to: pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
        businessUnit: businessUnitId,
        customerId,
        tab: SubscriptionTabRoutes.OnHold,
      }),
    },
    {
      content: `Closed ・ ${subscriptionStore.getCustomerCountByStatus(
        SubscriptionStatusEnum.Closed,
      )}`,
      to: pathToUrl(Paths.CustomerSubscriptionModule.Subscriptions, {
        businessUnit: businessUnitId,
        customerId,
        tab: SubscriptionTabRoutes.Closed,
      }),
    },
  ];

  const handleSearch = useCallback(
    (search: string) => {
      store.requestSearch(search, { businessUnitId, customerId });
    },
    [store, businessUnitId, customerId],
  );

  return (
    <TableTools.HeaderNavigation
      routes={routes}
      placeholder="Search Subscriptions"
      onSearch={handleSearch}
    />
  );
};

export default observer(CustomerSubscriptionTableNavigation);
