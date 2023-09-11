import OriginsAndDestinations from '@starlightpro/recycling/views/OriginsAndDestinations';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

const config: Config<ISystemConfigurationTable> = {
  title: 'Origins And Destinations',
  icon: () => null,
  Component: OriginsAndDestinations,
  path: 'origins-and-destinations',
};

export default config;
