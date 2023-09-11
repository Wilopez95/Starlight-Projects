import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { InvoiceType } from '@root/finance/types/entities';

import { InvoiceQuickViewTabs } from './types';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.Text.';

export const useTabConfigs = (
  invoiceType: InvoiceType,
): NavigationConfigItem<InvoiceQuickViewTabs>[] => {
  const { t } = useTranslation();
  let firstTab: NavigationConfigItem<InvoiceQuickViewTabs> = {
    index: 0,
    label: t(`${I18N_PATH}Orders`),
    key: InvoiceQuickViewTabs.Orders,
  };

  if (invoiceType === InvoiceType.subscriptions) {
    firstTab = {
      index: 0,
      label: t(`${I18N_PATH}Subscriptions`),
      key: InvoiceQuickViewTabs.Subscriptions,
    };
  }

  return [
    firstTab,
    {
      index: 1,
      label: t(`${I18N_PATH}Payments`),
      key: InvoiceQuickViewTabs.Payments,
    },
  ];
};
