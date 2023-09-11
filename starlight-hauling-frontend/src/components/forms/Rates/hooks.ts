import { NavigationConfigItem } from '@starlightpro/shared-components';
import i18next from 'i18next';

import { isCore } from '@root/consts/env';
import { BusinessUnit } from '@root/stores/entities';
import { BusinessUnitType } from '@root/types';

import { RatesConfigType } from './types';

export const I18N_PATH = 'components.forms.Rates.Text.';

export const useNavigation = (
  businessUnit: BusinessUnit | null,
  isRollOff: boolean,
): NavigationConfigItem<RatesConfigType>[] => {
  if (!businessUnit) {
    return [];
  }

  if (isCore || isRollOff || businessUnit.type === BusinessUnitType.RECYCLING_FACILITY) {
    const navItems: NavigationConfigItem<RatesConfigType>[] = [
      {
        label:
          businessUnit.type === BusinessUnitType.RECYCLING_FACILITY
            ? i18next.t(`${I18N_PATH}FacilityFee`)
            : i18next.t(`${I18N_PATH}OneTimeServices`),
        key: 'services',
        index: 0,
      },
      {
        label: i18next.t(`${I18N_PATH}LineItems`),
        key: 'lineItems',
        index: 1,
      },
      {
        label: i18next.t(`${I18N_PATH}Thresholds`),
        key: 'thresholds',
        index: 2,
      },
    ];

    if (businessUnit.type !== BusinessUnitType.RECYCLING_FACILITY) {
      navItems.push({
        label: i18next.t(`${I18N_PATH}Surcharges`),
        key: 'surcharges',
        index: 3,
      });
    }

    return navItems;
  }

  return [
    {
      label: i18next.t(`${I18N_PATH}OneTimeServices`),
      key: 'services',
      index: 0,
    },
    {
      label: i18next.t(`${I18N_PATH}RecurringServices`),
      key: 'recurringServices',
      index: 1,
    },
    {
      label: i18next.t(`${I18N_PATH}LineItems`),
      key: 'lineItems',
      index: 2,
    },
    {
      label: i18next.t(`${I18N_PATH}RecurringLineItems`),
      key: 'recurringLineItems',
      index: 3,
    },
    {
      label: i18next.t(`${I18N_PATH}Thresholds`),
      key: 'thresholds',
      index: 4,
    },
    {
      label: i18next.t(`${I18N_PATH}Surcharges`),
      key: 'surcharges',
      index: 5,
    },
  ];
};
