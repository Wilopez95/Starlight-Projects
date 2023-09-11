import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { TableHeadCell, TableHeader, TableSortableHeadCell } from '@root/common/TableTools';

import { useBusinessContext, useStores } from '@root/hooks';
import { masterRouteSortKeys } from '@root/types/entities/masterRoute';
import { SortType } from '@root/types';
import { getStoredFiltering } from '@root/helpers/storedFiltering';
import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';

const I18N_ROOT_PATH = 'pages.Dispatcher.components.MasterRoutesGrid.Table.Headers.Text.';

interface IWorkOrderTableHeader {
  tableContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export const MasterRoutesGridTableHeader: React.FC<IWorkOrderTableHeader> = observer(
  ({ tableContainerRef }) => {
    const { t } = useTranslation();

    const { masterRoutesStore } = useStores();

    const { businessUnitId } = useBusinessContext();

    const handleSortChange = useCallback(
      async (sortBy: masterRouteSortKeys, sortOrder: SortType) => {
        const filterOptions = getStoredFiltering();

        const filters: IHaulingServiceItemsParams = { resetOffset: true, ...filterOptions };

        await masterRoutesStore.sortMasterRouteGrid(sortBy, sortOrder, businessUnitId, filters);
      },
      [masterRoutesStore],
    );

    return (
      <TableHeader>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.customerName}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Customer`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.subscriptionId}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}SubscriptionId`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.jobSiteName}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}JobSite`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.serviceName}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Service`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.serviceFrequencyName}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}ServiceFrequency`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.materialName}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}Material`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.equipmentSize}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}EquipmentSize`)}
          </Typography>
        </TableSortableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.currentRoute}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}CurrentRoute`)}
          </Typography>
        </TableSortableHeadCell>
        <TableHeadCell>
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}NewRoute`)}
          </Typography>
        </TableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.currentSequence}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}CurrentSequence`)}
          </Typography>
        </TableSortableHeadCell>
        <TableHeadCell>
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}NewSequence`)}
          </Typography>
        </TableHeadCell>
        <TableSortableHeadCell
          sortKey={masterRouteSortKeys.currentServiceDay}
          tableRef={tableContainerRef}
          onSort={handleSortChange}
          currentSortBy={masterRoutesStore.sortBy}
          sortOrder={masterRoutesStore.sortOrder}
        >
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}CurrentServiceDay`)}
          </Typography>
        </TableSortableHeadCell>
        <TableHeadCell>
          <Typography variant="bodyMedium" color="secondary" shade="light">
            {t(`${I18N_ROOT_PATH}NewServiceDay`)}
          </Typography>
        </TableHeadCell>
      </TableHeader>
    );
  },
);
