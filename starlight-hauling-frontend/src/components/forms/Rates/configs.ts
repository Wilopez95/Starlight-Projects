import { NavigationConfigItem } from '@starlightpro/shared-components';
import { TFunction } from 'i18next';

import { isCore } from '@root/consts/env';

import { RatesConfigType } from './types';

export const I18N_PATH = 'components.forms.Rates.Text.';

export const getRatesNavigationConfig = (
  t: TFunction,
  isRollOff: boolean,
): NavigationConfigItem<RatesConfigType>[] => {
  return isCore || isRollOff
    ? [
        {
          label: t(`${I18N_PATH}OneTimeServices`),
          key: 'services',
          index: 0,
        },
        {
          label: t(`${I18N_PATH}LineItems`),
          key: 'lineItems',
          index: 1,
        },
        {
          label: t(`${I18N_PATH}Thresholds`),
          key: 'thresholds',
          index: 2,
        },
        {
          label: t(`${I18N_PATH}Surcharges`),
          key: 'surcharges',
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
          label: t(`${I18N_PATH}LineItems`),
          key: 'lineItems',
          index: 2,
        },
        {
          label: t(`${I18N_PATH}RecurringLineItems`),
          key: 'recurringLineItems',
          index: 3,
        },
        {
          label: t(`${I18N_PATH}Thresholds`),
          key: 'thresholds',
          index: 4,
        },
        {
          label: t(`${I18N_PATH}Surcharges`),
          key: 'surcharges',
          index: 5,
        },
      ];
};
