import Scales from '@starlightpro/recycling/views/Scales';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

const config: Config<ISystemConfigurationTable> = {
  title: 'Scales',
  icon: () => null,
  Component: Scales,
  path: 'scales',
};

export default config;
