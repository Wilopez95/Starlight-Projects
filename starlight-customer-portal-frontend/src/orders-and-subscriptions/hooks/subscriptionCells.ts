import { useTranslation } from 'react-i18next';

import {
  CellParams,
  SortableTableTitles,
} from '@root/orders-and-subscriptions/components/TableSortableHeader/types';

const I18N_PATH = 'hooks.ordersAndSubscriptions.useSubscriptionCells.';

export type subscriptionCells = { [key in SortableTableTitles]: CellParams[] };

export const useSubscriptionCells = (): subscriptionCells => {
  const { t } = useTranslation();

  const customerSubscriptionCells: CellParams[] = [
    {
      title: t(`${I18N_PATH}StartDate`),
      sortKey: 'startDate',
    },
    {
      title: '#',
      sortKey: 'id',
    },
    {
      title: t(`${I18N_PATH}LineOfBusiness`),
      sortKey: 'businessLine',
    },
    {
      title: t(`${I18N_PATH}Service`),
      sortKey: 'serviceFrequency',
    },
    {
      title: t(`${I18N_PATH}ServiceFrequency`),
      sortKey: 'jobSiteId',
    },
    {
      title: t(`${I18N_PATH}NextServiceDate`),
      sortKey: 'nextServiceDate',
    },
    {
      title: t(`${I18N_PATH}Payment`),
      sortKey: 'payment',
    },
    {
      title: t(`${I18N_PATH}PricePerBillingCycle`),
      sortKey: 'billingCyclePrice',
    },
    {
      title: t(`${I18N_PATH}BillingCycle`),
      sortKey: 'billingCycle',
    },
  ];

  return {
    [SortableTableTitles.customerSubscriptions]: customerSubscriptionCells,
  };
};
