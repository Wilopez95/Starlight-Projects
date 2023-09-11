import { type FC, type SVGProps } from 'react';

import { type IBusinessUnit } from '@root/types';

import { type Config } from '../../tables/types';
import { ISystemConfigurationTable } from '../../types';

export interface INavigationPanel {
  selected: Config<ISystemConfigurationTable>;
  config: Config<ISystemConfigurationTable>[];
}

export interface IBusinessUnitNavigation {
  selectedUnit: IBusinessUnit;
  businessLineId?: string;
}

export interface IBusinessLineIcons {
  [index: string]: FC<SVGProps<HTMLOrSVGElement>>;
}
