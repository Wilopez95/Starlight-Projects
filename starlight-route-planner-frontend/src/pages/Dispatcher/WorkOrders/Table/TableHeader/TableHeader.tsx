import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TableHeader, TableSortableHeadCell } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { WorkOrderStoreSortType } from '@root/stores/workOrder/types';
import { SortType } from '@root/types';

const I18N_ROOT_PATH = 'Text.';

interface IWorkOrderTableHeader {
  tableContainerRef: React.MutableRefObject<HTMLDivElement | null>;
  loadMore: () => void;
}

export const WorkOrderTableHeader: React.FC<IWorkOrderTableHeader> = observer(
  ({ tableContainerRef, loadMore }) => {
    const { t } = useTranslation();
    const { workOrdersStore } = useStores();

    const handleSortChange = useCallback(
      (sortBy: WorkOrderStoreSortType, sortOrder: SortType) => {
        workOrdersStore.setSort(sortBy, sortOrder);
        workOrdersStore.cleanup();

        loadMore();
      },
      [workOrdersStore, loadMore],
    );

    return (
      <TableHeader>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.DisplayId}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}WO`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.AssignedRoute}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}AssignedRoute`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.ThirdPartyHaulerDescription}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}3pHauler`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.CompletedAt}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}CompletedAt`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          center
          sortKey={WorkOrderStoreSortType.InstructionsForDriver}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Instructions`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          center
          sortKey={WorkOrderStoreSortType.Comments}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Comment`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          center
          sortKey={WorkOrderStoreSortType.Media}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Media`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.Status}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Status`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={WorkOrderStoreSortType.JobSite}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={workOrdersStore.sortBy}
          sortOrder={workOrdersStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}JobSite`)}
          </Typography>
        </TableSortableHeadCell>
      </TableHeader>
    );
  },
);
