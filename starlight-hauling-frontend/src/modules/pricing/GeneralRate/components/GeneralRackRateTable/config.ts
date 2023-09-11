import i18next from 'i18next';

import { PriceGroupsIcon } from '@root/assets';

import { Config } from '../../../../../pages/SystemConfiguration/tables/types';
import { ISystemConfigurationTable } from '../../../../../pages/SystemConfiguration/types';

import * as GeneralRackRatesTable from './GeneralRackRateTable';

const config: Config<ISystemConfigurationTable> = {
  title: `${i18next.t('Titles.GeneralRackRates')} [NEW]`,
  icon: PriceGroupsIcon,
  Component: GeneralRackRatesTable.default,
  path: 'general-rack-rates-new',
};

export default config;
