import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  DateRangeFilter,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { useBusinessContext, useStores } from '@root/hooks';
import { getSubscriptionOrderStatusLabel } from '@root/stores/subscriptionOrder/helpers';
import { SubscriptionOrderStatusEnum } from '@root/types';

import { IFilters } from '../types';

const I18N_PATH = 'components.SubscriptionOrdersTable.components.Filters.Text.';

export const Filters: React.FC<IFilters> = observer(({ onApply, isCompletedTab }) => {
  const { businessUnitId } = useBusinessContext();
  const { businessUnitStore } = useStores();
  const businessUnit = businessUnitStore.getById(businessUnitId);
  const { t } = useTranslation();
  const statusOptions = useMemo(
    () => [
      {
        label: t(
          `consts.SubscriptionOrderStatuses.${getSubscriptionOrderStatusLabel(
            SubscriptionOrderStatusEnum.completed,
          )}`,
        ),
        value: SubscriptionOrderStatusEnum.completed,
      },
      {
        label: t(
          `consts.SubscriptionOrderStatuses.${getSubscriptionOrderStatusLabel(
            SubscriptionOrderStatusEnum.needsApproval,
          )}`,
        ),
        value: SubscriptionOrderStatusEnum.needsApproval,
      },
    ],
    [t],
  );

  return (
    <TableFilter onApply={onApply}>
      <TableFilterConfig label={t(`${I18N_PATH}ServiceDate`)} filterByKey="filterByServiceDate">
        <DateRangeFilter
          fromDatePropName="filterByServiceDateFrom"
          toDatePropName="filterByServiceDateTo"
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}BusinessLine`)} filterByKey="filterByBusinessLine">
        <MultiSelectFilter
          searchable
          options={
            businessUnit?.businessLines.map(businessLine => ({
              label: businessLine?.name ?? '',
              value: businessLine.id,
            })) ?? []
          }
        />
      </TableFilterConfig>
      {isCompletedTab ? (
        <TableFilterConfig label={t(`${I18N_PATH}Status`)} filterByKey="filterByStatus">
          <MultiSelectFilter options={statusOptions} />
        </TableFilterConfig>
      ) : null}
    </TableFilter>
  );
});
