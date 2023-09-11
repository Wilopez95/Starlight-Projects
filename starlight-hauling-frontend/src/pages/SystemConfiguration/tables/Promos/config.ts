import { PromosIcon } from '@root/assets';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import * as PromosTable from './PromosTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Promos',
  icon: PromosIcon,
  Component: PromosTable.default,
  path: 'promos',
};

export default config;
