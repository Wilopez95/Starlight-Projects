import { NavigationConfigItem } from '@starlightpro/shared-components';
import { TFunction } from 'i18next';

import { isCore } from '@root/consts/env';

import { TaxRatesConfigType } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxRates.Text.';

export const getTaxRatesNavigationConfig = (
  t: TFunction,
  isRollOff: boolean,
  isRecycling: boolean,
): NavigationConfigItem<TaxRatesConfigType>[] =>
  isCore || isRollOff || isRecycling
    ? [
        {
          label: t(`${I18N_PATH}OneTimeServices`),
          key: 'services',
          index: 0,
        },
        {
          label: t(`${I18N_PATH}Materials`),
          key: 'materials',
          index: 2,
        },
        {
          label: t(`${I18N_PATH}LineItems`),
          key: 'lineItems',
          index: 3,
        },
      ]
    : [
        {
          label: t(`${I18N_PATH}OneTimeServices`),
          key: 'services',
          index: 0,
        },
        {
          label: t(`${I18N_PATH}RecurringServices`),
          key: 'recurringServices',
          index: 1,
        },
        {
          label: t(`${I18N_PATH}Materials`),
          key: 'materials',
          index: 2,
        },
        {
          label: t(`${I18N_PATH}LineItems`),
          key: 'lineItems',
          index: 3,
        },
        {
          label: t(`${I18N_PATH}RecurringLineItems`),
          key: 'recurringLineItems',
          index: 4,
        },
      ];
