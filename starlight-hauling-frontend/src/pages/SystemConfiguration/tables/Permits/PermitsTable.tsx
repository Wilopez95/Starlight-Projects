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
import { useBusinessContext, useCrudPermissions, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { PermitsQuickView } from '@root/quickViews';

import { PageHeader } from '../../components';
import { ISystemConfigurationTable } from '../../types';

import configurationStyle from '../../css/styles.scss';

const PermitsTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const newButtonRef = useRef<HTMLButtonElement>(null);

  const { permitStore, systemConfigurationStore } = useStores();
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();
  const [canViewPermits, _, canCreatePermits] = useCrudPermissions('configuration', 'permits');

  const { businessLineId, businessUnitId } = useBusinessContext();

  const tbodyContainerRef = useRef(null);

  const selectedPermit = permitStore.selectedEntity;

  useEffect(() => {
    if (!canViewPermits) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    if (businessUnitId && businessLineId) {
      permitStore.cleanup();
      permitStore.request({ businessUnitId, businessLineId });
    }
  }, [canViewPermits, permitStore, businessUnitId, businessLineId]);

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.Permits')} />
      <PageHeader
        button={canCreatePermits ? 'Add New Permit' : undefined}
        title="Permits"
        buttonRef={newButtonRef}
      />
      <TableTools.ScrollContainer>
        <PermitsQuickView
          isOpen={permitStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>Status</TableTools.HeaderCell>
            <TableTools.HeaderCell>Number</TableTools.HeaderCell>
            <TableTools.HeaderCell>Expiration Date</TableTools.HeaderCell>
            <TableTools.HeaderCell>Job Site Address</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={4} ref={tbodyContainerRef} loading={permitStore.loading}>
            {permitStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => {
                  permitStore.selectEntity(item);
                }}
                selected={selectedPermit?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.number}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {formatDateTime(item.expirationDate).date}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {/* {item.jobSite?.jobSiteAddressId || (
                  <span className={styles.notLinked}>Not Linked</span>
                )} */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(PermitsTable);
