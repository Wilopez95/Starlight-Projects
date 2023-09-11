import { EquipmentItemsIcon } from '@root/assets';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../../types';

import EquipmentItemsTable from './EquipmentItemsTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Equipment',
  icon: EquipmentItemsIcon,
  Component: EquipmentItemsTable,
  path: 'equipment-items',
};

export default config;
