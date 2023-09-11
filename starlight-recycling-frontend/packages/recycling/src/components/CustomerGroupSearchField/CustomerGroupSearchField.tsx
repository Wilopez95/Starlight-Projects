import React, { FC, useMemo } from 'react';

import SearchFieldAutocomplete from '../SearchFieldAutocomplete';
import { useGetHaulingCustomerGroupsQuery } from '../../graphql/api';
import { BaseSearchFieldProps } from '../Filter';

export interface CustomerGroupSearchFieldProps extends BaseSearchFieldProps {}

export const CustomerGroupSearchField: FC<CustomerGroupSearchFieldProps> = (props) => {
  const { data } = useGetHaulingCustomerGroupsQuery({
    variables: {
      filter: {
        activeOnly: true,
      },
    },
    fetchPolicy: 'network-only',
  });
  const options = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.haulingCustomerGroups.map((group) => ({
      label: group.description,
      value: group.id,
    }));
  }, [data]);

  return <SearchFieldAutocomplete fullWidth options={options} {...props} />;
};

export default CustomerGroupSearchField;
