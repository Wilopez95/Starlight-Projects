import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { InvoicingType } from '@root/api';

const i18nPath = 'pages.Invoices.Text.';

export const useOrderConfig = (
  orderLength: number,
  subscriptionLength: number,
  hasUnFinalizedOrders: boolean,
  hasOverPaidOrOverLimitOrders: boolean,
): NavigationConfigItem<InvoicingType>[] => {
  const { t } = useTranslation();

  return [
    {
      index: 0,
      key: InvoicingType.Orders,
      label: t(`${i18nPath}Orders`, { count: orderLength }),
      disabled: orderLength === 0,
      warning: hasOverPaidOrOverLimitOrders,
    },
    {
      index: 1,
      key: InvoicingType.Subscriptions,
      label: t(`${i18nPath}Subscriptions`, { count: subscriptionLength }),
      disabled: subscriptionLength === 0,
      warning: hasUnFinalizedOrders,
    },
  ];
};
