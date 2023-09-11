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
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { PromosQuickView } from '@root/quickViews';

import { PageHeader } from '../../components';
import { ISystemConfigurationTable } from '../../types';

import configurationStyle from '../../css/styles.scss';

const PromosTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const { systemConfigurationStore, promoStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const [canViewPromos, _, canCreatePromos] = useCrudPermissions('configuration', 'promos');

  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPromo = promoStore.selectedEntity;

  useEffect(() => {
    if (canViewPromos) {
      promoStore.request({ businessUnitId, businessLineId });
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [promoStore, businessUnitId, businessLineId, canViewPromos]);

  useCleanup(promoStore);

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.Promos')} />
      <PageHeader
        button={canCreatePromos ? 'Add New Promo' : undefined}
        title="Promos"
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <PromosQuickView
          isOpen={promoStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>Status</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={250}>Description</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>Code</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>Start Date</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>End Date</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={250}>Note</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody loading={promoStore.loading} ref={tbodyContainerRef} cells={6}>
            {promoStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => promoStore.selectEntity(item)}
                selected={selectedPromo?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.description}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.code}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.startDate ? formatDateTime(item.startDate).date : null}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.endDate ? formatDateTime(item.endDate).date : null}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  <span className={configurationStyle.tableCellDescription}>{item.note}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(PromosTable);
