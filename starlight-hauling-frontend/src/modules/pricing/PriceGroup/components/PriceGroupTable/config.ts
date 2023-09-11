import i18next from 'i18next';

import { PriceGroupsIcon } from '@root/assets';

import { Config } from '../../../../../pages/SystemConfiguration/tables/types';
import { ISystemConfigurationTable } from '../../../../../pages/SystemConfiguration/types';

import * as PriceGroupsTable from './PriceGroupsTable';

const config: Config<ISystemConfigurationTable> = {
  title: `${i18next.t('Titles.PriceGroups')} [NEW]`,
  icon: PriceGroupsIcon,
  Component: PriceGroupsTable.default,
  path: 'price-groups-new',
};

export default config;
