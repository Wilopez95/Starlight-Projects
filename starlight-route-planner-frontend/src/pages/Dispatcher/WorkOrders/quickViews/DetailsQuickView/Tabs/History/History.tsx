import React, { useEffect, useMemo } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import OrderHistoryGroup from '@root/common/OrderHistory/components/HistoryGroup/HistoryGroup';
import { HistoryGroupSkeleton } from '@root/common/OrderHistory/components/HistoryGroupSkeleton/HistoryGroupSkeleton';
import { useStores } from '@root/hooks';

import { ITabs } from '../types';

const loadingItems = range(8).map(item => <HistoryGroupSkeleton key={item} />);

const HistoryTab: React.FC<ITabs> = ({ workOrder }) => {
  const { workOrderHistory, businessLineStore } = useStores();

  useEffect(() => {
    workOrderHistory.getHistory(workOrder.id);

    return () => {
      workOrderHistory.cleanup();
    };
  }, [workOrderHistory, workOrder.id]);

  const workOrderType = useMemo(() => {
    return businessLineStore.getById(workOrder.businessLineId)?.type;
  }, [businessLineStore, workOrder]);

  useEffect(() => {
    workOrderHistory.setWorkOrderType(workOrderType);

    return () => {
      workOrderHistory.setWorkOrderType(undefined);
    };
  }, [workOrderHistory, workOrderType]);

  if (workOrderHistory.loading) {
    return <>{loadingItems}</>;
  }

  return (
    <Layouts.Padding top="2">
      {workOrderHistory.values.map(historyItem => (
        <OrderHistoryGroup historyItem={historyItem} key={historyItem.id} />
      ))}
    </Layouts.Padding>
  );
};

export default observer(HistoryTab);
