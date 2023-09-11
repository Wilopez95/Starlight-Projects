import { PermitsIcon } from '@root/assets';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import * as PermitsTable from './PermitsTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Permits',
  icon: PermitsIcon,
  Component: PermitsTable.default,
  path: 'permits',
};

export default config;
