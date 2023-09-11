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
import { ConfigurationCustomerGroupQuickView } from '@root/quickViews';
import { CustomerGroupType } from '@root/types';

import { PageHeader } from '../SystemConfiguration/components';

const I18N_PATH = 'pages.SystemConfiguration.tables.CustomerGroups.Text.';

const customerGroupTypeLabels = {
  [CustomerGroupType.commercial]: 'Commercial',
  [CustomerGroupType.nonCommercial]: 'NonCommercial',
  [CustomerGroupType.walkUp]: 'WalkUp',
};

const CustomerGroupsTable: React.FC = () => {
  const { customerGroupStore, systemConfigurationStore } = useStores();
  const tbodyContainerRef = useRef(null);
  const { t } = useTranslation();
  const [canViewCustomerGroups, _, canCreateCustomerGroups] = useCrudPermissions(
    'configuration',
    'customer-groups',
  );

  const selectedCustomerGroup = customerGroupStore.selectedEntity;

  useEffect(() => {
    if (canViewCustomerGroups) {
      customerGroupStore.request();
    } else {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
    }
  }, [customerGroupStore, canViewCustomerGroups]);

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.CustomersGroups')} />
      <ConfigurationCustomerGroupQuickView
        clickOutContainers={tbodyContainerRef}
        isOpen={customerGroupStore.isOpenQuickView || systemConfigurationStore.isCreating}
      />
      <PageHeader
        button={canCreateCustomerGroups ? t(`${I18N_PATH}AddNewCustomerGroup`) : undefined}
        title={t(`${I18N_PATH}CustomerGroups`)}
      />
      <TableTools.ScrollContainer>
        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>{t('Text.Status')}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={200 + 48}>
              {t('Text.Description')}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={150}>{t('Text.Type')}</TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody cells={3} ref={tbodyContainerRef} loading={customerGroupStore.loading}>
            {customerGroupStore.sortedValues.map(item => (
              <TableRow
                key={item.id}
                onClick={() => {
                  customerGroupStore.selectEntity(item);
                }}
                selected={selectedCustomerGroup?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>{item.description}</Typography>
                </TableCell>
                <TableCell maxWidth={400}>
                  <Typography ellipsis>
                    {t(`${I18N_PATH}${customerGroupTypeLabels[item.type]}`)}
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

export default observer(CustomerGroupsTable);
