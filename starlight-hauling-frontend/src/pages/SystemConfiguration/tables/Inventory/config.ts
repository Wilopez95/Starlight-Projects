import { ToolsIcon } from '@starlightpro/shared-components';

import { type ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import * as InventoryTable from './InventoryTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Inventory',
  icon: ToolsIcon,
  Component: InventoryTable.default,
  path: 'inventory',
};

export default config;
