import { MaterialProfilesIcon } from '@root/assets';
import { Routes } from '@root/consts';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../../types';

import MaterialsTable from './MaterialProfilesTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Material Profiles',
  icon: MaterialProfilesIcon,
  Component: MaterialsTable,
  path: Routes.MaterialProfile,
};

export default config;
