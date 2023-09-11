import { PriceGroupsIcon } from '@root/assets';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import * as GeneralRackRatesTable from './GeneralRackRatesTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'General Rack Rates',
  icon: PriceGroupsIcon,
  Component: GeneralRackRatesTable.default,
  path: 'general-rack-rates',
};

export default config;
