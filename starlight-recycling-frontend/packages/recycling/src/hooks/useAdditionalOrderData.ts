import { useCallback } from 'react';
import { gql } from '@apollo/client';
import {
  GetAdditionalOrderDataQuery,
  OrderStatus,
  useGetAdditionalOrderDataLazyQuery,
} from '../graphql/api';
import { keyBy } from 'lodash-es';

gql`
  query GetAdditionalOrderData($search: SearchBodyInput!, $ids: [Int!]!) {
    ordersIndexed(search: $search) {
      data {
        id
        haulingOrderId
        netWeight
        graded
        hasWeightTicket
      }
    }
    ordersByHaulingId(ids: $ids) {
      id
      haulingOrderId
      weightTicketUrl
      weightTicketAttachedAt
      weightTicketCreator {
        id
        firstName
        lastName
      }
      WONumber
    }
  }
`;

const orderStatuses = [
  OrderStatus.Completed,
  OrderStatus.Approved,
  OrderStatus.Finalized,
  OrderStatus.Invoiced,
];

export type AdditionalOrderData = Pick<
  GetAdditionalOrderDataQuery['ordersIndexed']['data'][number],
  'id' | 'haulingOrderId' | 'netWeight' | 'graded' | 'hasWeightTicket'
> &
  Pick<
    GetAdditionalOrderDataQuery['ordersByHaulingId'][number],
    'weightTicketUrl' | 'weightTicketAttachedAt' | 'weightTicketCreator' | 'WONumber'
  >;

export type InitQueryFuncType = (orderIds?: number[], status?: string) => Promise<void>;

interface UseAdditionalOrderDataOptions {
  onOrdersResponse: (data?: AdditionalOrderData[]) => void;
}

export const useAdditionalOrderData = ({
  onOrdersResponse,
}: UseAdditionalOrderDataOptions): InitQueryFuncType => {
  const buildSearchInput = useCallback(
    (orderIds: number[], status?: string) => ({
      from: 0,
      size: orderIds.length,
      query: {
        bool: {
          filter: [
            {
              terms: {
                haulingOrderId: orderIds,
              },
            },
            {
              terms: {
                'status.keyword': status ? [status] : orderStatuses.map((status) => status),
              },
            },
          ],
        },
      },
    }),
    [],
  );

  const [fetchQuery] = useGetAdditionalOrderDataLazyQuery({
    onCompleted: (data) => {
      const ordersById = keyBy(data.ordersByHaulingId, 'id');
      const result = data.ordersIndexed.data.map((indexed) => ({
        ...indexed,
        ...ordersById[indexed.id],
      }));
      onOrdersResponse(result);
    },
  });

  return useCallback<InitQueryFuncType>(
    async (orderIds: number[] = [], status?: string) => {
      const search = buildSearchInput(orderIds, status);

      await fetchQuery({ variables: { search, ids: orderIds } });
    },
    [fetchQuery, buildSearchInput],
  );
};
