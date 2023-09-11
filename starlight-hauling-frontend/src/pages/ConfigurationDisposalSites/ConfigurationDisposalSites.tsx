import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useCrudPermissions, useStores } from '@root/hooks';
import { DisposalSitesQuickView, MaterialMappingQuickView } from '@root/quickViews';

import { PageHeader } from '../SystemConfiguration/components';

const I18N_PATH = 'pages.SystemConfiguration.tables.DisposalSites.Text.';

const ConfigurationDisposalSites: React.FC = () => {
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const { disposalSiteStore, systemConfigurationStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { t } = useTranslation();
  const [canViewDisposalSites, _, canCreateDisposalSites] = useCrudPermissions(
    'configuration',
    'disposal-sites',
  );

  const selectedDisposalSite = disposalSiteStore.selectedEntity;

  useEffect(() => {
    if (canViewDisposalSites) {
      disposalSiteStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [disposalSiteStore, canViewDisposalSites]);

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.Waypoints')} />
      <PageHeader
        button={canCreateDisposalSites ? t(`${I18N_PATH}AddNewWaypoint`) : undefined}
        title={t(`${I18N_PATH}Waypoints`)}
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <DisposalSitesQuickView
          isOpen={disposalSiteStore.isOpenQuickView || systemConfigurationStore.isCreating}
          shouldDeselect={!(disposalSiteStore.isMappingOpen || disposalSiteStore.isRatesOpen)}
        />
        <MaterialMappingQuickView
          isOpen={disposalSiteStore.isMappingOpen}
          onClose={disposalSiteStore.closeMapping}
          shouldDeselect={false}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t('Text.Description')}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}WaypointType`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t('Text.Address')}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody ref={tbodyContainerRef} cells={4} loading={disposalSiteStore.loading}>
            {disposalSiteStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                onClick={() => disposalSiteStore.selectEntity(item)}
                selected={selectedDisposalSite?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.description}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{startCase(item.waypointType)}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.fullAddress}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ConfigurationDisposalSites);
