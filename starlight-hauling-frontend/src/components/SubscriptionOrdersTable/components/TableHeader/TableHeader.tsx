/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { TableCheckboxCell, TableTools } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';

import { ITableHeader } from '../types';

const I18N_PATH = buildI18Path('components.SubscriptionOrdersTable.components.TableHeader.');

export const TableHeader: React.FC<ITableHeader> = ({
  requestOptions,
  isSelectable,
  isCompletedTab,
}) => {
  const { subscriptionOrderStore } = useStores();
  const { t } = useTranslation();
  const handleSortChange = useCallback(() => {
    subscriptionOrderStore.request(requestOptions);
  }, [subscriptionOrderStore, requestOptions]);

  const { isAllChecked } = subscriptionOrderStore;
  const { isAllNeedsApprovalChecked } = subscriptionOrderStore;
  const checkedOrders = subscriptionOrderStore.checkedSubscriptionOrders;
  const indeterminate = !isAllChecked && checkedOrders.length > 0;

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.checked;
      // eslint-disable-next-line no-unused-expressions
      isCompletedTab
        ? subscriptionOrderStore.checkAll(value)
        : subscriptionOrderStore.checkNeedsApproval(value);
    },
    [subscriptionOrderStore, isCompletedTab],
  );

  return (
    <TableTools.Header>
      {isSelectable ? (
        <TableCheckboxCell
          header
          name="checkAllSubscriptionOrders"
          onChange={handleCheckAll}
          value={isCompletedTab ? isAllChecked : isAllNeedsApprovalChecked}
          indeterminate={indeterminate}
        />
      ) : null}
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="serviceDate"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}ServiceDate`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="id"
        onSort={handleSortChange}
      >
        #
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>{t(`${I18N_PATH.Text}BusinessLine`)}</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="status"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}Status`)}
      </TableTools.SortableHeaderCell>

      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="jobSite"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}JobSite`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="service"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}Service`)}
      </TableTools.SortableHeaderCell>
      <TableTools.HeaderCell>{t(`${I18N_PATH.Text}Customer`)}</TableTools.HeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="assignedRoute"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}PreferredRoute`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="total"
        onSort={handleSortChange}
        right
      >
        {t(`${I18N_PATH.Text}Total`)}
      </TableTools.SortableHeaderCell>
      <TableTools.SortableHeaderCell
        store={subscriptionOrderStore}
        sortKey="comment"
        onSort={handleSortChange}
      >
        {t(`${I18N_PATH.Text}Comment`)}
      </TableTools.SortableHeaderCell>
    </TableTools.Header>
  );
};
