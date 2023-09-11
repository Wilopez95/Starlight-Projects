import React, { FC, useMemo } from 'react';
import gql from 'graphql-tag';
import { Box } from '@material-ui/core';
import { HistoryGroupSkeleton } from './components/HistoryGroupSkeleton/HistoryGroupSkeleton';
import { useGetAggregatedOrderHistoryQuery } from '../../../../graphql/api';
import { IOrderHistory } from './types';
import { HistoryGroup } from './components/HistoryGroup/HistoryGroup';

interface Props {
  orderId: number;
}

gql`
  query GetAggregatedOrderHistory($orderId: Int!) {
    aggregatedOrderHistory(orderId: $orderId)
  }
`;

export const OrderHistory: FC<Props> = ({ orderId }) => {
  const { data, loading } = useGetAggregatedOrderHistoryQuery({
    variables: {
      orderId,
    },
    fetchPolicy: 'no-cache',
  });
  const { aggregatedOrderHistory } = data || {};

  const sortedHistory = useMemo(() => {
    const sorted = Object.entries(
      (aggregatedOrderHistory as IOrderHistory) || [],
    ).sort(([isoDateA], [isoDateB]) => (new Date(isoDateA) > new Date(isoDateB) ? -1 : 1));

    return sorted.map(([timestamp, historyItems]) => {
      return <HistoryGroup historyItems={historyItems} timestamp={timestamp} />;
    });
  }, [aggregatedOrderHistory]);

  return loading ? <HistoryGroupSkeleton /> : <Box>{sortedHistory}</Box>;
};
