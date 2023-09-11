import React, { useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import OrderHistoryGroup from '@root/common/OrderHistory/components/HistoryGroup/HistoryGroup';
import { HistoryGroupSkeleton } from '@root/common/OrderHistory/components/HistoryGroupSkeleton/HistoryGroupSkeleton';
import { useStores } from '@root/hooks';
import { IDashboardDailyRoute } from '@root/types';

interface IProps {
  dailyRoute: IDashboardDailyRoute;
}

const loadingItems = range(8).map(item => <HistoryGroupSkeleton key={item} />);

const HistoryTab: React.FC<IProps> = ({ dailyRoute }) => {
  const { dailyRouteHistoryStore } = useStores();

  useEffect(() => {
    dailyRouteHistoryStore.getHistory(dailyRoute.id);

    return () => {
      dailyRouteHistoryStore.cleanup();
    };
  }, [dailyRouteHistoryStore, dailyRoute.id]);

  if (dailyRouteHistoryStore.loading) {
    return <>{loadingItems}</>;
  }

  return (
    <Layouts.Padding top="2">
      {dailyRouteHistoryStore.values.map(item => (
        <OrderHistoryGroup historyItem={item} key={item.id} />
      ))}
    </Layouts.Padding>
  );
};

export default observer(HistoryTab);
