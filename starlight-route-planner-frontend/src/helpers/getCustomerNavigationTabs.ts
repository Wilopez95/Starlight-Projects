import { Paths } from '@root/consts';
import { CustomerGroupStore } from '@root/stores/customerGroup/CustomerGroupStore';
import { CustomerStoreCountResponse } from '@root/types';

import { getHaulingRedirectUrl } from './getHaulingRedirectUrl';
import { pathToUrl } from './pathToUrl';

export const getCustomerNavigationTabs = (
  businessUnitId: number,
  counts: CustomerStoreCountResponse,
  customerGroupStore: CustomerGroupStore,
) => {
  const getRedirectUrl = getHaulingRedirectUrl(window.location.hostname);
  const pathToAllCustomers = getRedirectUrl(
    pathToUrl(Paths.CustomersModule.Customers, {
      businessUnit: businessUnitId,
      customerGroupId: 'all',
    }),
  );

  return [
    {
      label: 'All Customers',
      to: pathToAllCustomers,
      count: counts.total,
      key: 'all',
      index: 0,
    },
    ...Object.entries(counts.customerGroupIds).map(([key, count], index) => {
      const customerGroup = customerGroupStore.getById(key);

      const pathToCustomerGroup = getRedirectUrl(
        pathToUrl(Paths.CustomersModule.Customers, {
          businessUnit: businessUnitId,
          customerGroupId: key,
        }),
      );

      return {
        count,
        label: customerGroup?.description ?? '',
        to: pathToCustomerGroup,
        key,
        index: index + 1,
      };
    }),
  ];
};
