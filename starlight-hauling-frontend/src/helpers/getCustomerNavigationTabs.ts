import { Paths } from '@root/consts';
import { type CustomerGroupStore } from '@root/stores/customerGroup/CustomerGroupStore';
import { CustomerGroupType, CustomerStoreCountResponse } from '@root/types';

import { pathToUrl } from './pathToUrl';

export const getCustomerNavigationTabs = (
  businessUnitId: string,
  isRecyclingFacility: boolean,
  counts: CustomerStoreCountResponse,
  customerGroupStore: CustomerGroupStore,
) => {
  const pathToAllCustomers = pathToUrl(Paths.CustomersModule.Customers, {
    businessUnit: businessUnitId,
    customerGroupId: 'all',
  });

  const activeCustomerGroups = customerGroupStore.values.filter(x => x.active);

  return [
    {
      label: 'All Customers',
      to: pathToAllCustomers,
      count: counts.total,
      key: 'all',
      index: 0,
    },
    ...(isRecyclingFacility
      ? []
      : activeCustomerGroups
          .filter(customerGroup => customerGroup.type !== CustomerGroupType.walkUp)
          .map((group, index) => {
            const groupId = group.id?.toString();

            const count = counts.customerGroupIds[groupId];

            const pathToCustomerGroup = pathToUrl(Paths.CustomersModule.Customers, {
              businessUnit: businessUnitId,
              customerGroupId: groupId,
            });

            return {
              count,
              label: group.description,
              to: pathToCustomerGroup,
              key: groupId,
              index: index + 1,
            };
          })),
  ];
};
