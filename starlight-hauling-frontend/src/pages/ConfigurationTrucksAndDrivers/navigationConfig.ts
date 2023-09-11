import { useTranslation } from 'react-i18next';
import { NavigationConfigItem } from '@starlightpro/shared-components';

import { TrucksAndDriversEnum } from '@root/pages/ConfigurationTrucksAndDrivers/types';

import { Drivers, Trucks, TruckTypes } from './components';

const I18N_PATH = 'pages.SystemConfiguration.tables.TrucksAndDrivers.Text.';

export const useNavigationConfig = (): NavigationConfigItem<TrucksAndDriversEnum>[] => {
  const { t } = useTranslation();

  return [
    {
      index: 0,
      label: t(`${I18N_PATH}Drivers`),
      key: TrucksAndDriversEnum.Drivers,
      component: Drivers,
    },
    {
      index: 1,
      label: t(`${I18N_PATH}Trucks`),
      key: TrucksAndDriversEnum.Trucks,
      component: Trucks,
    },
    {
      index: 2,
      label: t(`${I18N_PATH}TruckTypes`),
      key: TrucksAndDriversEnum.TruckTypes,
      component: TruckTypes,
    },
  ];
};
