import { MaterialsIcon } from '@root/assets';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../../types';

import MaterialsTable from './MaterialsTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Materials',
  icon: MaterialsIcon,
  Component: MaterialsTable,
  path: 'materials',
};

export default config;
