import React from 'react';
import gql from 'graphql-tag';
import { Field } from 'react-final-form';

import { useGetOrderCustomerBusinessNamesQuery } from '../../../../graphql/api';
import SearchFieldAutocomplete from '../../../../components/SearchFieldAutocomplete';
import { FilterSearchValueType } from '../../../../components/Datatable/fields/SearchValueField';
import { SelectOption } from '@starlightpro/common';

gql`
  query GetOrderCustomerBusinessNames(
    $filter: OrderFilterInput
    $sort: [SortInput!]!
    $pagination: PaginationInput
  ) {
    orders(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        customer {
          businessName
        }
      }
      total
    }
  }
`;

export const CustomerFilter = ({ onChange, name }: any) => {
  const { data } = useGetOrderCustomerBusinessNamesQuery({
    variables: {
      sort: [],
      pagination: {
        page: 1,
        perPage: 10,
      },
    },
  });

  const options =
    data?.orders.data
      .filter((x) => x.customer.businessName)
      .map((order) => ({
        value: order.customer.businessName!,
        label: order.customer.businessName!,
      })) || [];

  return (
    <Field name={name}>
      {(props) => (
        <SearchFieldAutocomplete
          {...props}
          options={options}
          label=""
          renderOption={(option) => <SelectOption {...option} data-cy={option.label} />}
          data-cy="Customer Filter"
          onChange={(newValue: FilterSearchValueType) => {
            onChange && onChange(newValue);
          }}
        />
      )}
    </Field>
  );
};
