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
import { ConfigurationBrokerQuickView } from '@root/quickViews';

import { PageHeader } from '../SystemConfiguration/components';

const I18N_PATH = 'pages.SystemConfiguration.tables.Brokers.Text.';

const ConfigurationBrokers: React.FC = () => {
  const { brokerStore, systemConfigurationStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { t } = useTranslation();
  const [canViewBrokers, _, canCreateBrokers] = useCrudPermissions('configuration', 'brokers');

  const brokers = brokerStore.sortedValues;
  const selectedBroker = brokerStore.selectedEntity;

  useEffect(() => {
    if (canViewBrokers) {
      brokerStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [brokerStore, canViewBrokers]);

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.Brokers')} />
      <PageHeader
        button={canCreateBrokers ? t(`${I18N_PATH}AddNewBroker`) : undefined}
        title={t(`${I18N_PATH}Brokers`)}
      />
      <TableTools.ScrollContainer>
        <ConfigurationBrokerQuickView
          clickOutContainers={tbodyContainerRef}
          isOpen={brokerStore.isOpenQuickView || systemConfigurationStore.isCreating}
        />
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>{t('Text.Name')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={50}>
              {t(`${I18N_PATH}ShortName`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={100}>{t(`Text.Email`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={150}>{t(`${I18N_PATH}Billing`)}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody ref={tbodyContainerRef} cells={5} loading={brokerStore.loading}>
            {brokers.map(item => (
              <TableRow
                key={item.id}
                onClick={() => {
                  brokerStore.selectEntity(item);
                }}
                selected={selectedBroker?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.name}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.shortName}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.email}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>
                    {t(`${I18N_PATH}InvoiceThe`, { billing: item.billing })}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(ConfigurationBrokers);
