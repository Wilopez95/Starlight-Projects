import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
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
import { ThirdPartyHaulersQuickView } from '@root/quickViews';

import PageHeader from '../SystemConfiguration/components/PageHeader/PageHeader';

const I18N_PATH = 'pages.SystemConfiguration.tables.ThirdPartyHaulers.Text.';

const ThirdPartyHaulersTable: React.FC = () => {
  const { thirdPartyHaulerStore, systemConfigurationStore } = useStores();
  const { t } = useTranslation();
  const tbodyContainerRef = useRef(null);
  const [canViewHaulers, _, canCreateHaulers] = useCrudPermissions(
    'configuration',
    'third-party-haulers',
  );

  const selectedThirdPartyHauler = thirdPartyHaulerStore.selectedEntity;

  useEffect(() => {
    if (!canViewHaulers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    thirdPartyHaulerStore.request();
  }, [canViewHaulers, thirdPartyHaulerStore]);

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.ThirdPartyHaulers')} />
      <PageHeader
        button={canCreateHaulers ? t(`${I18N_PATH}AddNew3rdPartyHauler`) : undefined}
        title={t(`${I18N_PATH}3rdPartyHaulers`)}
      />
      <TableTools.ScrollContainer>
        <ThirdPartyHaulersQuickView
          clickOutContainers={tbodyContainerRef}
          isOpen={thirdPartyHaulerStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Active')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={400}>{t('Text.Description')}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody loading={thirdPartyHaulerStore.loading} ref={tbodyContainerRef} cells={5}>
            {thirdPartyHaulerStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                onClick={() => thirdPartyHaulerStore.selectEntity(item)}
                selected={selectedThirdPartyHauler?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.description}</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ThirdPartyHaulersTable);
