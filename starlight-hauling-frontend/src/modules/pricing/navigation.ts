import { NavigationConfigItem } from '@starlightpro/shared-components';
import i18next from 'i18next';

import { isCore } from '@root/consts/env';
import { BusinessUnit } from '@root/stores/entities';
import { BusinessUnitType } from '@root/types';

import { RatesEntityType } from './const';

export const I18N_PATH = 'modules.pricing.Text.';

export const useNavigation = (
  businessUnit: BusinessUnit | null,
  isRollOff: boolean,
): NavigationConfigItem<RatesEntityType>[] => {
  if (!businessUnit) {
    return [];
  }

  if (isCore || isRollOff || businessUnit.type === BusinessUnitType.RECYCLING_FACILITY) {
    const navItems: NavigationConfigItem<RatesEntityType>[] = [
      {
        label: i18next.t(`${I18N_PATH}OneTimeServices`),
        key: RatesEntityType.oneTimeService,
        index: 0,
      },
      {
        label: i18next.t(`${I18N_PATH}LineItems`),
        key: RatesEntityType.oneTimeLineItem,
        index: 1,
      },
      {
        label: i18next.t(`${I18N_PATH}Thresholds`),
        key: RatesEntityType.threshold,
        index: 2,
      },
    ];

    if (businessUnit.type !== BusinessUnitType.RECYCLING_FACILITY) {
      navItems.push({
        label: i18next.t(`${I18N_PATH}Surcharges`),
        key: RatesEntityType.surcharge,
        index: 3,
      });
    }

    return navItems;
  }

  return [
    {
      label: i18next.t(`${I18N_PATH}OneTimeServices`),
      key: RatesEntityType.oneTimeService,
      index: 0,
    },
    {
      label: i18next.t(`${I18N_PATH}RecurringServices`),
      key: RatesEntityType.recurringService,
      index: 1,
    },
    {
      label: i18next.t(`${I18N_PATH}LineItems`),
      key: RatesEntityType.oneTimeLineItem,
      index: 2,
    },
    {
      label: i18next.t(`${I18N_PATH}RecurringLineItems`),
      key: RatesEntityType.recurringLineItem,
      index: 3,
    },
    {
      label: i18next.t(`${I18N_PATH}Thresholds`),
      key: RatesEntityType.threshold,
      index: 4,
    },
    {
      label: i18next.t(`${I18N_PATH}Surcharges`),
      key: RatesEntityType.surcharge,
      index: 5,
    },
  ];
};
