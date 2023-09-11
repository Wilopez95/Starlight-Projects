import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  Divider,
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
import { buildI18Path } from '@root/i18n/helpers';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';
import { EquipmentItemsQuickView } from '@root/quickViews';
import { useBusinessContext, useCrudPermissions, useStores } from '@hooks';

import PageHeader from '../../../../components/PageHeader/PageHeader';

import configurationStyle from '../../../../css/styles.scss';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.EquipmentItems.',
);

const EquipmentItemsTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const { t } = useTranslation();
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const { equipmentItemStore, systemConfigurationStore, businessLineStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { businessLineId } = useBusinessContext();
  const businessLine = businessLineStore.getById(businessLineId);
  const [canViewEquipment, _, canCreateEquipment] = useCrudPermissions(
    'configuration',
    'equipment',
  );

  const selectedEquipmentItem = equipmentItemStore.selectedEntity;

  useEffect(() => {
    if (!canViewEquipment) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    equipmentItemStore.request({ businessLineId });
  }, [equipmentItemStore, businessLineId, canViewEquipment]);

  if (!businessLine) {
    return null;
  }

  const recyclingEquipmentItem = equipmentItemStore.sortedValues.find(
    equipmentItem => equipmentItem.recyclingDefault,
  );

  const equipments = equipmentItemStore.sortedValues.filter(
    equipmentItem => !equipmentItem.recyclingDefault,
  );

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.Equipment')} />
      <PageHeader
        button={canCreateEquipment ? t(`${I18N_PATH.Text}AddNewEquipment`) : undefined}
        title={t(`${I18N_PATH.Text}Equipment`)}
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <EquipmentItemsQuickView
          clickOutContainers={tbodyContainerRef}
          isOpen={equipmentItemStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t(`Text.Status`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH.Text}ShortDescription`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`Text.Description`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={3} ref={tbodyContainerRef} loading={equipmentItemStore.loading}>
            {recyclingEquipmentItem ? (
              <>
                <TableRow
                  key={recyclingEquipmentItem.id}
                  className={configurationStyle.customRow}
                  onClick={() => {
                    recyclingEquipmentItem &&
                      equipmentItemStore.selectEntity(recyclingEquipmentItem);
                  }}
                  selected={selectedEquipmentItem?.id === recyclingEquipmentItem.id}
                >
                  <TableCell>
                    <StatusBadge active={recyclingEquipmentItem.active} />
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {recyclingEquipmentItem.shortDescription}
                  </TableCell>
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {recyclingEquipmentItem.description}
                  </TableCell>
                </TableRow>
                <Divider colSpan={4} />
              </>
            ) : null}
            {equipments.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => {
                  equipmentItemStore.selectEntity(item);
                }}
                selected={selectedEquipmentItem?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.shortDescription}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.description}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(EquipmentItemsTable);
