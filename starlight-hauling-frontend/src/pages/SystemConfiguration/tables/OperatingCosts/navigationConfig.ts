import { NavigationConfigItem } from '@starlightpro/shared-components';
import i18next from 'i18next';

import { OperatingCostTabs } from '@root/consts';

const I18N_PATH = 'pages.SystemConfiguration.tables.OperatingCosts.Text.';

export const navigationConfig: NavigationConfigItem[] = [
  {
    index: 0,
    label: i18next.t(`${I18N_PATH}TruckAndDrivers`),
    key: OperatingCostTabs.TrucksAndDrivers,
  },
  {
    index: 1,
    label: i18next.t(`${I18N_PATH}DisposalRates`),
    key: OperatingCostTabs.DisposalRates,
  },
  {
    index: 2,
    label: i18next.t(`${I18N_PATH}3rdPartyHaulerRates`),
    key: OperatingCostTabs.ThirdPartyHaulerRates,
  },
];
