import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { InvoiceType } from '@root/modules/billing/Invoices/types';

import { InvoiceQuickViewTabs } from './types';

const i18nPath = 'pages.Invoices.components.InvoiceQuickView.Text.';

export const useTabConfigs = (
  invoiceType: InvoiceType,
): NavigationConfigItem<InvoiceQuickViewTabs>[] => {
  const { t } = useTranslation();
  let firstTab: NavigationConfigItem<InvoiceQuickViewTabs> = {
    index: 0,
    label: t(`${i18nPath}Orders`),
    key: InvoiceQuickViewTabs.Orders,
  };

  if (invoiceType === InvoiceType.subscriptions) {
    firstTab = {
      index: 0,
      label: t(`${i18nPath}Subscriptions`),
      key: InvoiceQuickViewTabs.Subscriptions,
    };
  }

  return [
    firstTab,
    {
      index: 1,
      label: t(`${i18nPath}Payments`),
      key: InvoiceQuickViewTabs.Payments,
    },
    {
      index: 2,
      label: t(`${i18nPath}EmailLog`),
      key: InvoiceQuickViewTabs.EmailLog,
    },
  ];
};
