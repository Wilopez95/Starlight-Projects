import { NavigationConfigItem } from '@starlightpro/shared-components';
import { TFunction } from 'i18next';

import { isCore } from '@root/consts/env';

import { RatesEntityType } from './const';

const I18N_PATH = 'modules.pricing.Text.';

export const getRatesNavigationConfig = (
  t: TFunction,
  isRollOff: boolean,
): NavigationConfigItem<RatesEntityType>[] => {
  return isCore || isRollOff
    ? [
        {
          label: t(`${I18N_PATH}OneTimeServices`),
          key: RatesEntityType.oneTimeService,
          index: 0,
        },
        {
          label: t(`${I18N_PATH}LineItems`),
          key: RatesEntityType.oneTimeLineItem,
          index: 1,
        },
        {
          label: t(`${I18N_PATH}Thresholds`),
          key: RatesEntityType.threshold,
          index: 2,
        },
        {
          label: t(`${I18N_PATH}Surcharges`),
          key: RatesEntityType.surcharge,
          index: 3,
        },
      ]
    : [
        {
          label: t(`${I18N_PATH}OneTimeServices`),
          key: RatesEntityType.oneTimeService,
          index: 0,
        },
        {
          label: t(`${I18N_PATH}RecurringServices`),
          key: RatesEntityType.recurringService,
          index: 1,
        },
        {
          label: t(`${I18N_PATH}LineItems`),
          key: RatesEntityType.oneTimeLineItem,
          index: 2,
        },
        {
          label: t(`${I18N_PATH}RecurringLineItems`),
          key: RatesEntityType.recurringLineItem,
          index: 3,
        },
        {
          label: t(`${I18N_PATH}Thresholds`),
          key: RatesEntityType.threshold,
          index: 4,
        },
        {
          label: t(`${I18N_PATH}Surcharges`),
          key: RatesEntityType.surcharge,
          index: 5,
        },
      ];
};
