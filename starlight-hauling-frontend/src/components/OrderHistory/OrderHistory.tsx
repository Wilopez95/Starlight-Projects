import React, { useEffect, useState } from 'react';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { type OrderHistory } from '@root/types';

import { OrderHistoryGroup } from './components/HistoryGroup/HistoryGroup';
import { HistoryGroupSkeleton } from './components/HistoryGroupSkeleton/HistoryGroupSkeleton';
import { IOrderHistory } from './types';

const loadingItems = range(8).map(item => <HistoryGroupSkeleton key={item} />);

const OrderHistoryTab: React.FC<IOrderHistory> = ({ orderId }) => {
  const { orderStore } = useStores();
  const [history, setHistory] = useState<OrderHistory | null>(null);

  useEffect(() => {
    const query = async () => {
      setHistory(null);

      const historyData = await orderStore.getOrderHistory(orderId);

      setHistory(historyData as OrderHistory);
    };

    query();
  }, [orderId, orderStore]);

  if (history === null) {
    return <>{loadingItems}</>;
  }

  return (
    <>
      {Object.entries(history).map(([timestamp, historyItems]) => (
        <OrderHistoryGroup timestamp={timestamp} historyItems={historyItems} key={timestamp} />
      ))}
    </>
  );
};

export default observer(OrderHistoryTab);
