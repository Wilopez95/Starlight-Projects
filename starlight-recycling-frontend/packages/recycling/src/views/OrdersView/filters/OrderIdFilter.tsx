import React from 'react';
import gql from 'graphql-tag';
import { Field } from 'react-final-form';

import { useGetOrderIdsQuery } from '../../../graphql/api';
import { FilterSearchValueType } from '../../../components/Datatable/fields/SearchValueField';
import SearchFieldAutocomplete from '../../../components/SearchFieldAutocomplete';

gql`
  query GetOrderIds($filter: OrderFilterInput, $sort: [SortInput!]!, $pagination: PaginationInput) {
    orders(filter: $filter, sort: $sort, pagination: $pagination) {
      data {
        id
      }
      total
    }
  }
`;

export const OrderIdFilter = ({ onChange, name }: any) => {
  const { data } = useGetOrderIdsQuery({
    variables: {
      sort: [],
      pagination: {
        page: 1,
        perPage: 10,
      },
    },
  });

  const options =
    data?.orders.data.map((order) => ({
      value: order.id,
      label: order.id.toString(),
    })) || [];

  return (
    <Field name={name}>
      {(props) => (
        <SearchFieldAutocomplete
          {...props}
          options={options}
          label=""
          data-cy="Order # Filter"
          onChange={(newValue: FilterSearchValueType) => {
            onChange && onChange(newValue);
          }}
        />
      )}
    </Field>
  );
};
