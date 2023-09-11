import { useEffect, useMemo, useState } from 'react';
import { CustomerOption } from '../../../components/FinalForm/CustomerSearchField';
import {
  CustomerFilter,
  HaulingCustomerStatus,
  useGetHaulingCustomersLazyQuery,
} from '../../../graphql/api';
import debounce from 'lodash/debounce';
import { SelectOptionType } from '../../../components/FinalForm/SearchField';
import { gql } from '@apollo/client';

gql`
  query getHaulingCustomers($filter: CustomerFilter!) {
    haulingCustomers(filter: $filter) {
      data {
        id
        businessName
        poRequired
        workOrderRequired
        gradingRequired
        jobSiteRequired
        commercial
        popupNote
        gradingNotification
        active
        onHold
        canTareWeightRequired
        type
        selfServiceOrderAllowed
        onAccount
      }
    }
  }
`;

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_TIMEOUT = 300;

export const useDebouncedHaulingCustomersRequest = (
  customerFilter: CustomerFilter = {
    filterByState: [HaulingCustomerStatus.Active, HaulingCustomerStatus.OnHold],
  },
) => {
  const [isInitialQuery, setIsInitialQuery] = useState<boolean>(true);
  const [currentQuery, setCurrentQuery] = useState<string>('');

  const [getHaulingCustomers, { data, loading }] = useGetHaulingCustomersLazyQuery({
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (isInitialQuery) {
      getHaulingCustomers({
        variables: {
          filter: customerFilter,
        },
      });
      setIsInitialQuery(false);
    }
  }, [isInitialQuery, setIsInitialQuery, customerFilter, getHaulingCustomers]);

  const setInputDebounced = debounce((value: string | SelectOptionType) => {
    let searchTerm: string = value as string;

    if (typeof value !== 'string') {
      searchTerm = value.label;
    }

    if ((!!searchTerm && searchTerm.length > MIN_SEARCH_LENGTH) || !searchTerm) {
      getHaulingCustomers({
        variables: {
          filter: {
            query: searchTerm,
            ...customerFilter,
          },
        },
      });
      setCurrentQuery(searchTerm);
    }
  }, DEBOUNCE_TIMEOUT);

  const customerOptions = useMemo(() => {
    if (!data?.haulingCustomers) {
      return [];
    }

    const { haulingCustomers } = data;

    return haulingCustomers.data
      .filter(({ businessName, id }) =>
        (businessName || `${id}`).toLowerCase().includes(currentQuery.toLowerCase()),
      )
      .map((customer) => ({
        label: customer.businessName || `${customer.id}`,
        value: customer.id,
        customer,
      })) as CustomerOption[];
  }, [data, currentQuery]);

  return {
    data,
    customerOptions,
    loading,
    setInputDebounced,
    refetch: getHaulingCustomers,
    isInitialQuery,
  };
};
