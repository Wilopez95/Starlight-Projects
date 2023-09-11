import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import {
  Income,
  // DeferredIncome,
  Taxes,
  Payments,
  DefaultAccounts,
} from '../components';

const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.Text.';

export const useNavigationConfig = (): NavigationConfigItem[] => {
  const { t } = useTranslation();

  return [
    {
      index: 0,
      label: t(`${I18N_PATH}Income`),
      key: 'Income',
      component: Income,
    },
    // {   // DISABLED TEMPORARILY
    //   index: 1,
    //   label: t(`${I18N_PATH}DeferredIncome`),
    //   key: 'DeferredIncome',
    //   component: DeferredIncome,
    // },
    {
      index: 2,
      label: t(`${I18N_PATH}Taxes`),
      key: 'Taxes',
      component: Taxes,
    },
    {
      index: 3,
      label: t(`${I18N_PATH}Payments`),
      key: 'Payments',
      component: Payments,
    },
    {
      index: 4,
      label: t(`${I18N_PATH}DefaultAccounts`),
      key: 'DefaultAccounts',
      component: DefaultAccounts,
    },
  ];
};
