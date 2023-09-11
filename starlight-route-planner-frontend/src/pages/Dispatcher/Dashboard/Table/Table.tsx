import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableInfiniteScroll,
  TableScrollContainer,
} from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';

import { defaultValues as dashboardFilterDefaultValues } from '../quickViews/FiltersQuickView/formikData';

import { DashboardTableHeader } from './TableHeader/TableHeader';
import { TableRow } from './TableRow';
import { IDashboardTable } from './types';

const I18N_PATH = 'pages.Dispatcher.components.Dashboard.Table.Text.';

export const DashboardTable: React.FC<IDashboardTable> = observer(({ handleDailyRouteClick }) => {
  const { t } = useTranslation();
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const { dashboardStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const canEffectDateChanges = useRef(false);

  const request = useCallback(
    async (reset = false) => {
      await dashboardStore.getDashboardList(businessUnitId, dashboardFilterDefaultValues, {
        cleanUp: reset,
        resetOffset: reset,
      });

      canEffectDateChanges.current = true;
    },
    [businessUnitId, dashboardStore],
  );

  useEffect(() => {
    if (canEffectDateChanges.current) {
      request(true);
    }
  }, [dashboardStore.serviceDate, request]);

  const loadMore = useCallback(() => {
    request();
  }, [request]);

  return (
    <TableScrollContainer ref={tableContainerRef}>
      <Table>
        <DashboardTableHeader tableContainerRef={tableContainerRef} loadMore={loadMore} />
        <TableBody loading={dashboardStore.loading} noResult={dashboardStore.noResult} cells={11}>
          {dashboardStore.values.map(dailyRoute => (
            <TableRow
              key={dailyRoute.id}
              dailyRoute={dailyRoute}
              handleDailyRouteClick={handleDailyRouteClick}
            />
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        loaded={dashboardStore.loaded}
        loading={dashboardStore.loading}
        onLoaderReached={loadMore}
      >
        {t(`${I18N_PATH}LoadMore`)}
      </TableInfiniteScroll>
    </TableScrollContainer>
  );
});
