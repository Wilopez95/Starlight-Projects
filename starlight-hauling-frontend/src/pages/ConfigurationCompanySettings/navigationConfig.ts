import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { isCore } from '@root/consts/env';

import {
  DomainsSettings,
  FinanceChargesSettings,
  GeneralSettings,
  MailingSettings,
  Accounting,
} from './components';

const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.Text.';

export const useNavigationConfig = (): NavigationConfigItem[] => {
  const { t } = useTranslation();

  return isCore
    ? [
        {
          index: 0,
          label: t(`${I18N_PATH}General`),
          key: 'general',
          component: GeneralSettings,
        },
        {
          index: 1,
          label: t(`${I18N_PATH}FinanceCharges`),
          key: 'financeCharges',
          component: FinanceChargesSettings,
        },
        {
          index: 2,
          label: t(`${I18N_PATH}Mailing`),
          key: 'mailing',
          component: MailingSettings,
        },
        {
          index: 3,
          label: t(`${I18N_PATH}Domains`),
          key: 'domains',
          component: DomainsSettings,
        },
        {
          index: 4,
          label: t(`${I18N_PATH}AccountingIntegration`),
          key: 'accountingIntegration',
          component: Accounting,
        },
      ]
    : [
        {
          index: 0,
          label: t(`${I18N_PATH}General`),
          key: 'general',
          component: GeneralSettings,
        },
        {
          index: 1,
          label: t(`${I18N_PATH}FinanceCharges`),
          key: 'financeCharges',
          component: FinanceChargesSettings,
        },
        {
          index: 2,
          label: t(`${I18N_PATH}Mailing`),
          key: 'mailing',
          component: MailingSettings,
        },
        {
          index: 3,
          label: t(`${I18N_PATH}Domains`),
          key: 'domains',
          component: DomainsSettings,
        },
        {
          index: 4,
          label: t(`${I18N_PATH}qbIntegrationConfiguration`),
          key: 'accountingIntegration',
          component: Accounting,
        },
      ];
};
