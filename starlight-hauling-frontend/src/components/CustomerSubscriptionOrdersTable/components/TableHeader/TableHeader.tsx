import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';

import { ISubscriptionOrdersTableHeader } from './types';

const I18N_PATH = 'components.SubscriptionOrdersTable.components.TableHeader.Text.';

const SubscriptionOrdersTableHeader: React.FC<ISubscriptionOrdersTableHeader> = ({
  requestOptions,
}) => {
  const { subscriptionOrderStore } = useStores();
  const { t } = useTranslation();

  const handleSortChange = useCallback(() => {
    subscriptionOrderStore.requestBySubscriptionId(requestOptions);
  }, [subscriptionOrderStore, requestOptions]);

  return (
    <TableTools.Header>
      <TableTools.HeaderCell />
      <TableTools.SortableHeaderCell
        sortKey="id"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        #
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="assignedRoute"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}PreferredRoute`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        sortKey="service"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}Service`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="jobSiteId"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}JobSite`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="serviceDate"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}ServiceDate`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="comment"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}Comment`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        sortKey="status"
        store={subscriptionOrderStore}
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH}Status`)}
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};

export const TableHeader = observer(SubscriptionOrdersTableHeader);
