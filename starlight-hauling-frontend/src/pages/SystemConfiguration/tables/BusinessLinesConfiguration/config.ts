import { BusinessLinesIcon } from '@root/assets';
import { Params, Routes } from '@root/consts';

import { ISystemConfigurationTable } from '../../types';
import { Config } from '../types';

import BusinessLinesConfiguration from './BusinessLinesConfiguration';

const BusinessLinesConfigurationConfig: Config<ISystemConfigurationTable> = {
  Component: BusinessLinesConfiguration,
  title: 'Lines of Business',
  path: `${Routes.BusinessLines}/${Params.businessLine}`,
  exact: false,
  hideTab: true,
  icon: BusinessLinesIcon,
};

export default BusinessLinesConfigurationConfig;
