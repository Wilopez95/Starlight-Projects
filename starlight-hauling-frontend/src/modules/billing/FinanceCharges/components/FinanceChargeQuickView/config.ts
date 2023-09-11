import { NavigationConfigItem } from '@starlightpro/shared-components';

import { FinanceChargeQuickViewTabs } from './types';

export const tabConfigs: NavigationConfigItem<FinanceChargeQuickViewTabs>[] = [
  {
    index: 0,
    label: 'Invoices',
    key: 'invoices',
  },
  {
    index: 1,
    label: 'Payments',
    key: 'payments',
  },
  {
    index: 2,
    label: 'Email Log',
    key: 'emailLog',
  },
];
