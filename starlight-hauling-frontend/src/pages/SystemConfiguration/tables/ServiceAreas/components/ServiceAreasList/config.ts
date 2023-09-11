import { ISystemConfigurationView } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../../types';

import ServiceAreasTable from './ServiceAreasTable';

const config: Config<ISystemConfigurationView> = {
  icon: () => null,
  title: 'Service Areas',
  Component: ServiceAreasTable,
  path: 'service-areas',
};

export default config;
