import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../types';

import BillableItemsConfig from './BillableItems/config';
import EquipmentConfig from './EquipmentItems/config';
import MaterialProfilesConfig from './MaterialProfiles/config';
import MaterialConfig from './Materials/config';

export const configs: Config<ISystemConfigurationTable>[] = [
  BillableItemsConfig,
  MaterialConfig,
  MaterialProfilesConfig,
  EquipmentConfig,
];
