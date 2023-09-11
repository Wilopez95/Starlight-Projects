import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

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
import { useIntl } from '@root/i18n/useIntl';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';
import { MaterialProfilesQuickView } from '@root/quickViews';
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@hooks';

import PageHeader from '../../../../components/PageHeader/PageHeader';

import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH =
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.MaterialProfiles.Text.';

const MaterialProfilesTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const { materialProfileStore, systemConfigurationStore, disposalSiteStore, materialStore } =
    useStores();
  const tbodyContainerRef = useRef(null);
  const { businessLineId } = useBusinessContext();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const [canViewMaterialProfiles, _, canCreateMaterialProfiles] = useCrudPermissions(
    'configuration',
    'material-profiles',
  );
  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');

  useCleanup(materialProfileStore);
  useCleanup(materialStore);

  const selectedMaterialProfile = materialProfileStore.selectedEntity;

  useEffect(() => {
    if (!canViewMaterialProfiles || !canViewMaterials || !canViewDisposalSites) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    materialProfileStore.request({
      materials: true,
      disposals: true,
      businessLineId,
    });

    materialStore.request(
      {
        manifestedOnly: true,
        businessLineId,
      },
      !canViewEquipment,
    );

    disposalSiteStore.request({ activeOnly: true });
  }, [
    materialStore,
    materialProfileStore,
    disposalSiteStore,
    businessLineId,
    canViewMaterialProfiles,
    canViewMaterials,
    canViewDisposalSites,
    canViewEquipment,
  ]);

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.MaterialProfiles')} />
      <PageHeader
        button={canCreateMaterialProfiles ? t(`${I18N_PATH}AddNew`) : undefined}
        title={t(`${I18N_PATH}MaterialProfiles`)}
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <MaterialProfilesQuickView
          clickOutContainers={tbodyContainerRef}
          isOpen={materialProfileStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={250}>{t('Text.Description')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={250}>{t('Text.DisposalSite')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={250}>{t('Text.Material')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>{t('Text.ExpirationDate')}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody
            loading={
              materialStore.loading || materialProfileStore.loading || disposalSiteStore.loading
            }
            ref={tbodyContainerRef}
            cells={5}
          >
            {materialProfileStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => materialProfileStore.selectEntity(item)}
                selected={selectedMaterialProfile?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.description}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.disposalSiteDescription ?? item.disposalSite?.description}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.materialDescription ?? item.material?.description}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.expirationDate ? formatDateTime(item.expirationDate).date : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(MaterialProfilesTable);
