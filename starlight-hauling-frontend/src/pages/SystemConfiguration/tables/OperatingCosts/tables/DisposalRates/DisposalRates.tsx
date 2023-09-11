import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Table, TableBody, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCrudPermissions, useStores } from '@root/hooks';
import { DisposalRatesQuickView } from '@root/quickViews';

import { DisposalSite } from '@root/stores/entities';
import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH = 'pages.SystemConfiguration.tables.DisposalSites.Text.';

const DisposalRatesTable: React.FC = () => {
  const { disposalSiteStore } = useStores();
  const { t } = useTranslation();

  const [canViewDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');
  const [canViewOperatingCosts] = useCrudPermissions('configuration', 'operating-costs');

  useEffect(() => {
    if (canViewDisposalSites && canViewOperatingCosts) {
      disposalSiteStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [disposalSiteStore, canViewDisposalSites, canViewOperatingCosts]);

  const handleDisposalSiteClick = useCallback(
    item => {
      disposalSiteStore.selectEntity(item as DisposalSite);
      disposalSiteStore.selectedEntity?.openRates();
    },
    [disposalSiteStore],
  );

  return (
    <>
      <DisposalRatesQuickView isOpen={disposalSiteStore.isRatesOpen} />
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t('Text.Description')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}WaypointType`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t('Text.Address')}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={4} loading={disposalSiteStore.loading}>
          {disposalSiteStore.filteredValues.map(item => (
            <TableRow
              onClick={() => handleDisposalSiteClick(item)}
              key={item.id}
              className={configurationStyle.customRow}
            >
              <TableCell>
                <StatusBadge active={item.active} />
              </TableCell>
              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                {item.description}
              </TableCell>
              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                {startCase(item.waypointType)}
              </TableCell>
              <TableCell titleClassName={configurationStyle.tableCellTitle}>
                {item.fullAddress}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default observer(DisposalRatesTable);
