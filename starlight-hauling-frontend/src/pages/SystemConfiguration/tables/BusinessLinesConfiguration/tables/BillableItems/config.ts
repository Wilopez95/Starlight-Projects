import BillableItemsIcon from '@assets/img/billable-items.svg';

import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';

import { Config } from '../../../types';

import BillableItemsTable from './BillableItemsTable';

const config: Config<ISystemConfigurationTable> = {
  title: 'Billable Items',
  icon: BillableItemsIcon,
  Component: BillableItemsTable,
  path: 'billable-items',
};

export default config;
