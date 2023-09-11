import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, PlusIcon, StatusBadge, Switch } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

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
import { DriverQuickView } from '@root/quickViews';

import {
  TrucksAndDriversContainer,
  TrucksAndDriversContext,
} from '../TrucksAndDriversContainer/TrucksAndDriversContainer';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const Drivers: React.FC = () => {
  const { t } = useTranslation();
  const { driverStore, systemConfigurationStore } = useStores();
  const canCreate = usePermission('configuration:drivers-trucks:create');
  const selectedDriver = driverStore.selectedEntity;

  useCleanup(driverStore);

  const { filterState, search } = useContext(TrucksAndDriversContext);

  const requestParams = useMemo(
    () => ({
      ...filterState,
      query: search,
    }),
    [filterState, search],
  );

  const loading = driverStore.loading;
  const canAccessTypes = usePermission('configuration:drivers-trucks:list');

  const loadMore = useCallback(() => {
    driverStore.request(requestParams);
  }, [requestParams, driverStore]);

  useEffect(() => {
    if (!canAccessTypes) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      driverStore.markLoaded();

      return;
    }

    driverStore.cleanup();
    loadMore();
  }, [driverStore, canAccessTypes, loadMore]);

  const handleChangeInactive = useCallback(() => {
    systemConfigurationStore.toggleShow();
    driverStore.cleanup();
    loadMore();
  }, [driverStore, loadMore, systemConfigurationStore]);

  const handleAddNewTruck = useCallback(() => {
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
            <Button iconLeft={PlusIcon} variant="primary" onClick={handleAddNewTruck}>
              {t(`${I18N_PATH}AddNewDriver`)}
            </Button>
          </Layouts.Margin>
        ) : null}
      </TrucksAndDriversContainer>
      <TableTools.ScrollContainer>
        <DriverQuickView
          isOpen={systemConfigurationStore.isCreating || driverStore.isOpenQuickView}
        />
        <Table>
          <TableTools.Header>
            <TableTools.SortableHeaderCell
              store={driverStore}
              onSort={loadMore}
              sortKey="active"
              minWidth={50}
            >
              {t(`Text.Status`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={driverStore}
              sortKey="description"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}Name`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={driverStore}
              sortKey="truckDescription"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}Truck`)}
            </TableTools.SortableHeaderCell>
            <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}Phone`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{t(`${I18N_PATH}Email`)}</TableTools.HeaderCell>
            <TableTools.SortableHeaderCell
              store={driverStore}
              sortKey="businessUnitNames"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}BusinessUnits`)}
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody cells={2} loading={loading} noResult={driverStore.noResult}>
            {driverStore.values.map(driverType => (
              <TableRow
                key={driverType.id}
                onClick={() => {
                  systemConfigurationStore.toggleCreating(false);
                  driverStore.selectEntity(driverType);
                }}
                selected={selectedDriver?.id === driverType.id}
              >
                <TableCell>
                  <StatusBadge active={driverType.active}>
                    {driverType.active ? t(`Text.Active`) : t(`Text.Inactive`)}
                  </StatusBadge>
                </TableCell>
                <TableCell>{driverType?.description}</TableCell>
                <TableCell>{driverType?.truck?.description}</TableCell>
                <TableCell>{driverType?.phone}</TableCell>
                <TableCell>{driverType?.email}</TableCell>
                <TableCell fallback="-">{driverType?.businessUnitNames}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={driverStore.loaded}
          loading={driverStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingResults`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(Drivers);
