import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import {
  DateRangeFilter,
  MultiSelectFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { getSubscriptionOrderStatusLabel } from '@root/stores/subscriptionOrder/helpers';
import { SubscriptionOrderStatusEnum } from '@root/types';

import { type ISubscriptionOrdersFilter } from './types';

const I18N_PATH = 'components.CustomerSubscriptionOrdersTable.Text.';
const SubscriptionOrdersFilter: React.FC<ISubscriptionOrdersFilter> = ({ onApply }) => {
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
      <TableFilterConfig label={t(`${I18N_PATH}ServiceDate`)} filterByKey="">
        <DateRangeFilter
          fromDatePropName="filterByServiceDateFrom"
          toDatePropName="filterByServiceDateTo"
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Status`)} filterByKey="filterByStatus">
        <MultiSelectFilter options={statusOptions} />
      </TableFilterConfig>
    </TableFilter>
  );
};

export default observer(SubscriptionOrdersFilter);
