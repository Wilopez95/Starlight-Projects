import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
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
import { useCleanup, useCrudPermissions, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { TruckAndDriverQuickView } from '@root/quickViews';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDriversCosts.Text.';

const TrucksAndDriversTable: React.FC = () => {
  const { t } = useTranslation();
  const { dateFormat } = useIntl();

  const { truckAndDriverCostStore, systemConfigurationStore, businessUnitStore } = useStores();

  const [canViewOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');

  const tbodyContainerRef = useRef(null);

  const getBUName = useCallback(
    (id?: number | null) => {
      if (!id) {
        const defaultName: string = t('Text.AllBusinessUnits');

        return defaultName;
      }

      return businessUnitStore.values.find(businessUnit => +businessUnit.id === +id)?.nameLine1;
    },
    [businessUnitStore.values, t],
  );

  useEffect(() => {
    if (canViewOperatingCosts) {
      businessUnitStore.request();
    }
  }, [businessUnitStore, canViewOperatingCosts]);

  const handleRequest = useCallback(() => {
    if (canViewOperatingCosts) {
      truckAndDriverCostStore.request({ activeOnly: !systemConfigurationStore.showInactive });
    } else {
      truckAndDriverCostStore.markLoaded();
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [canViewOperatingCosts, truckAndDriverCostStore, systemConfigurationStore.showInactive]);

  useEffect(() => {
    truckAndDriverCostStore.cleanup();
    handleRequest();
  }, [
    handleRequest,
    canViewOperatingCosts,
    truckAndDriverCostStore,
    systemConfigurationStore.showInactive,
  ]);

  useCleanup(truckAndDriverCostStore);

  const handleSelectTruckAndDrivers = useCallback(
    async item => {
      systemConfigurationStore.toggleDuplicating(false);
      systemConfigurationStore.toggleCreating(false);
      await truckAndDriverCostStore.requestById(item.id as number);
    },
    [truckAndDriverCostStore, systemConfigurationStore],
  );

  return (
    <>
      <TruckAndDriverQuickView
        isOpen={systemConfigurationStore.isCreating || truckAndDriverCostStore.isOpenQuickView}
      />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell minWidth={50 + 48}>
            {t(`${I18N_PATH}Status`)}
          </TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}EffectivePeriod`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}ChangedBy`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}BusinessUnit`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody ref={tbodyContainerRef} cells={4} loading={truckAndDriverCostStore.loading}>
          {truckAndDriverCostStore.sortedValues.map(item => (
            <TableRow
              selected={item.id === truckAndDriverCostStore.selectedEntity?.id}
              key={item.id}
              onClick={() => handleSelectTruckAndDrivers(item)}
            >
              <TableCell>
                {item.active ? (
                  <Badge borderRadius={2} color="success">
                    {t('Text.Active')}
                  </Badge>
                ) : (
                  <Badge borderRadius={2} color="primary">
                    {t('Text.Expired')}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Typography>{format(item.date, dateFormat.dateShortMonthYear)}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{item.changedBy?.name ?? ''}</Typography>
              </TableCell>
              <TableCell>{getBUName(item.businessUnitId)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={handleRequest}
        loaded={truckAndDriverCostStore.loaded}
        loading={truckAndDriverCostStore.loading}
        initialRequest={false}
      >
        {t(`${I18N_PATH}LoadingTrucksAndDriversCosts`)}
      </TableInfiniteScroll>
    </>
  );
};

export default observer(TrucksAndDriversTable);
