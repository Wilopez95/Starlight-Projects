import { PriceGroupsIcon } from '@root/assets';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import * as PriceGroupsTable from './PriceGroupsTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Price Groups',
  icon: PriceGroupsIcon,
  Component: PriceGroupsTable.default,
  path: 'price-groups',
};

export default config;
