import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, PlusIcon, StatusBadge } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Switch } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCleanup, usePermission, useStores } from '@root/hooks';
import { TruckQuickView } from '@root/quickViews';

import {
  TrucksAndDriversContainer,
  TrucksAndDriversContext,
} from '../TrucksAndDriversContainer/TrucksAndDriversContainer';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const Trucks: React.FC = () => {
  const { t } = useTranslation();
  const { truckStore, systemConfigurationStore } = useStores();
  const loading = truckStore.loading;
  const canAccessTypes = usePermission('configuration:drivers-trucks:list');
  const canCreate = usePermission('configuration:drivers-trucks:create');

  useCleanup(truckStore);
  const selectedTruck = truckStore.selectedEntity;

  const { filterState, search } = useContext(TrucksAndDriversContext);

  const requestParams = useMemo(
    () => ({
      ...filterState,
      query: search,
    }),
    [filterState, search],
  );

  const loadMore = useCallback(() => {
    truckStore.request(requestParams);
  }, [requestParams, truckStore]);

  useEffect(() => {
    if (!canAccessTypes) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      truckStore.markLoaded();

      return;
    }

    truckStore.cleanup();
    loadMore();
  }, [truckStore, canAccessTypes, loadMore]);

  const handleChangeInactive = useCallback(() => {
    systemConfigurationStore.toggleShow();
    truckStore.cleanup();
    loadMore();
  }, [loadMore, systemConfigurationStore, truckStore]);

  const handleCreationClick = useCallback(() => {
    systemConfigurationStore.toggleDuplicating(false);
    systemConfigurationStore.toggleCreating();
  }, [systemConfigurationStore]);

  return (
    <>
      <TrucksAndDriversContainer>
        <Layouts.Margin top="1">
          <Switch
            onChange={handleChangeInactive}
            value={systemConfigurationStore.showInactive}
            id="pageHeaderSwitch"
            name="pageHeaderSwitch"
          >
            {t(`${I18N_PATH}ShowInactive`)}
          </Switch>
        </Layouts.Margin>
        {canCreate ? (
          <Layouts.Margin left="2">
            <Button iconLeft={PlusIcon} variant="primary" onClick={handleCreationClick}>
              {t(`${I18N_PATH}AddNewTruck`)}
            </Button>
          </Layouts.Margin>
        ) : null}
      </TrucksAndDriversContainer>
      <TableTools.ScrollContainer>
        <TruckQuickView
          isOpen={systemConfigurationStore.isCreating || truckStore.isOpenQuickView}
        />
        <Table>
          <TableTools.Header>
            <TableTools.SortableHeaderCell
              store={truckStore}
              onSort={loadMore}
              sortKey="active"
              minWidth={50}
            >
              {t(`Text.Status`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell store={truckStore} sortKey="id" onSort={loadMore}>
              {t(`${I18N_PATH}TruckID`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckStore}
              sortKey="description"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}Description`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckStore}
              sortKey="truckTypeDescription"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}TruckType`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckStore}
              sortKey="licensePlate"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}LicensePlate`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckStore}
              sortKey="businessUnitNames"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}BusinessUnits`)}
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody cells={2} loading={loading} noResult={truckStore.noResult}>
            {truckStore.values.map(truck => (
              <TableRow
                key={truck.id}
                onClick={() => {
                  systemConfigurationStore.toggleCreating(false);
                  truckStore.selectEntity(truck);
                }}
                selected={selectedTruck?.id === truck.id}
              >
                <TableCell>
                  <StatusBadge active={truck.active}>
                    {truck.active ? t(`Text.Active`) : t(`Text.Inactive`)}
                  </StatusBadge>
                </TableCell>
                <TableCell>{truck.id}</TableCell>
                <TableCell>{truck.description}</TableCell>
                <TableCell>{truck.truckType.description}</TableCell>
                <TableCell>{truck.licensePlate}</TableCell>
                <TableCell fallback="-">{truck.businessUnitNames}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={truckStore.loaded}
          loading={truckStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingResults`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(Trucks);
