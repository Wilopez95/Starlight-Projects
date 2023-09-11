import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  TableHeadCell,
  TableHeader as BaseTableHeader,
  TableSortableHeadCell,
} from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { DashboardDailyRouteKeys, SortType } from '@root/types';

const I18N_PATH = 'pages.Dispatcher.components.Dashboard.Table.Text.';

interface IDashboardTableHeader {
  tableContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  loadMore?: () => void;
}

export const DashboardTableHeader: React.FC<IDashboardTableHeader> = observer(
  ({ tableContainerRef }) => {
    const { t } = useTranslation();
    const { dashboardStore } = useStores();

    const handleSortChange = useCallback(
      (sortBy: DashboardDailyRouteKeys, sortOrder: SortType) => {
        dashboardStore.sortDailyRoutes(sortBy, sortOrder);
      },
      [dashboardStore],
    );

    return (
      <BaseTableHeader>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.name}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`Text.Route`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.businessLineType}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}RouteType`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.numberOfStops}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}NumberOfStops`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.numberOfWos}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}NumberOfWOs`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.completedAt}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`Text.CompletedAt`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.driverName}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}DriverAssigned`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.truckId}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}TruckNumber`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.truckType}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}TruckType`)}
          </Typography>
        </TableSortableHeadCell>
        <TableHeadCell>
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`Text.Ticket`)}
          </Typography>
        </TableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.status}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`Text.Status`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={DashboardDailyRouteKeys.completionRate}
          currentSortBy={dashboardStore.sortBy}
          sortOrder={dashboardStore.sortOrder}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_PATH}CompletionRate`)}
          </Typography>
        </TableSortableHeadCell>
      </BaseTableHeader>
    );
  },
);
