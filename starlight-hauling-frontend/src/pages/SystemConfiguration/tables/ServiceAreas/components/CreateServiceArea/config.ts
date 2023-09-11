import { Routes } from '@root/consts';

import { ISystemConfigurationView } from '../../../../types';
import { Config } from '../../../types';

import * as CreateServiceArea from './CreateServiceArea';

const config: Config<ISystemConfigurationView> = {
  title: 'Service Areas',
  icon: () => null,
  Component: CreateServiceArea.default,
  path: `${Routes.ServiceAreas}/:id(\\d+|create)`,
};

export default config;
