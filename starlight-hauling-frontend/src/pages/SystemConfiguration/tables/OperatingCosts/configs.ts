import { OperatingCostsIcon } from '@root/assets';

import { ISystemConfigurationTable } from '../../types';
import { type Config } from '../types';

import OperatingCosts from './OperatingCosts';

const config: Config<ISystemConfigurationTable> = {
  title: 'Operating Costs',
  icon: OperatingCostsIcon,
  Component: OperatingCosts,
  path: 'operating-costs',
};

export default config;
