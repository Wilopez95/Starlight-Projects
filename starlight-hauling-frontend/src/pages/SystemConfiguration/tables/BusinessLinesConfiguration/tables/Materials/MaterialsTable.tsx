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
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';
import { MaterialsQuickView } from '@root/quickViews';
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@hooks';

import PageHeader from '../../../../components/PageHeader/PageHeader';

import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH =
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.Materials.Text.';

const MaterialsTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const { materialStore, equipmentItemStore, systemConfigurationStore, businessLineStore } =
    useStores();
  const tbodyContainerRef = useRef(null);
  const [canViewMaterials, _, canCreateMaterials] = useCrudPermissions(
    'configuration',
    'materials',
  );

  const { businessLineId } = useBusinessContext();
  const { t } = useTranslation();
  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  useCleanup(materialStore);

  const selectedMaterial = materialStore.selectedEntity;

  useEffect(() => {
    if (!canViewMaterials) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    materialStore.cleanup();
    materialStore.request({
      equipmentItems: true,
      businessLineId,
    });
  }, [materialStore, equipmentItemStore, businessLineId, canViewMaterials]);

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.Materials')} />
      <PageHeader
        button={canCreateMaterials ? t(`${I18N_PATH}AddNew`) : undefined}
        title={t('Text.Materials')}
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <MaterialsQuickView
          clickOutContainers={tbodyContainerRef}
          isOpen={materialStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>{t('Text.Description')}</TableTools.HeaderCell>
            {!isRecyclingLoB ? (
              <TableTools.HeaderCell minWidth={200}>
                {t(`${I18N_PATH}UsableEquipment`)}
              </TableTools.HeaderCell>
            ) : null}
          </TableTools.Header>
          <TableBody
            loading={materialStore.loading || equipmentItemStore.loading}
            ref={tbodyContainerRef}
            cells={3}
          >
            {materialStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => materialStore.selectEntity(item)}
                selected={selectedMaterial?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.description}
                </TableCell>
                {!isRecyclingLoB ? (
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {item.equipmentItemsDescriptions}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(MaterialsTable);
