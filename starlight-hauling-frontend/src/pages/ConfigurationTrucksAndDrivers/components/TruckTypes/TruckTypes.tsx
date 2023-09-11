import React, { useCallback, useEffect } from 'react';
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
import { usePermission, useStores } from '@root/hooks';
import { TruckTypeQuickView } from '@root/quickViews';

import { TrucksAndDriversContainer } from '../TrucksAndDriversContainer/TrucksAndDriversContainer';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

const TruckTypes: React.FC = () => {
  const { t } = useTranslation();
  const { truckTypeStore, systemConfigurationStore } = useStores();
  const loading = truckTypeStore.loading;
  const canAccessTypes = usePermission('configuration:drivers-trucks:list');
  const canCreate = usePermission('configuration:drivers-trucks:create');
  const selectedTruckType = truckTypeStore.selectedEntity;

  const loadMore = useCallback(() => {
    truckTypeStore.request();
  }, [truckTypeStore]);

  useEffect(() => {
    if (!canAccessTypes) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      truckTypeStore.markLoaded();

      return;
    }

    truckTypeStore.cleanup();
    loadMore();
  }, [truckTypeStore, canAccessTypes, loadMore]);

  const handleChangeInactive = useCallback(() => {
    systemConfigurationStore.toggleShow();
    truckTypeStore.cleanup();
    loadMore();
  }, [loadMore, systemConfigurationStore, truckTypeStore]);

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
              {t(`${I18N_PATH}AddNewTruckType`)}
            </Button>
          </Layouts.Margin>
        ) : null}
      </TrucksAndDriversContainer>
      <TableTools.ScrollContainer>
        <TruckTypeQuickView
          isOpen={systemConfigurationStore.isCreating || !!truckTypeStore.isOpenQuickView}
        />
        <Table>
          <TableTools.Header>
            <TableTools.SortableHeaderCell
              store={truckTypeStore}
              onSort={loadMore}
              sortKey="active"
              minWidth={50}
            >
              {t(`Text.Status`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckTypeStore}
              sortKey="description"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}Description`)}
            </TableTools.SortableHeaderCell>
            <TableTools.SortableHeaderCell
              store={truckTypeStore}
              sortKey="businessLineNames"
              onSort={loadMore}
            >
              {t(`${I18N_PATH}LinesOfBusiness`)}
            </TableTools.SortableHeaderCell>
          </TableTools.Header>
          <TableBody cells={2} loading={loading} noResult={truckTypeStore.noResult}>
            {truckTypeStore.values.map(truck => (
              <TableRow
                key={truck.id}
                onClick={() => {
                  systemConfigurationStore.toggleCreating(false);
                  truckTypeStore.selectEntity(truck);
                }}
                selected={selectedTruckType?.id === truck.id}
              >
                <TableCell>
                  <StatusBadge active={truck.active}>
                    {truck.active ? t(`Text.Active`) : t(`Text. Inactive`)}
                  </StatusBadge>
                </TableCell>
                <TableCell>{truck.description}</TableCell>
                <TableCell fallback="-">{truck.businessLineNames}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TableInfiniteScroll
          onLoaderReached={loadMore}
          loaded={truckTypeStore.loaded}
          loading={truckTypeStore.loading}
          initialRequest={false}
        >
          {t(`${I18N_PATH}LoadingResults`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </>
  );
};

export default observer(TruckTypes);
