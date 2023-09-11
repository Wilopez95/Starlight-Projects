import { isCore } from '@root/consts/env';

import { ISystemConfigurationTable, ISystemConfigurationView } from '../types';

import BusinessLinesConfigurationConfig from './BusinessLinesConfiguration/config';
import GeneralRackRatesConfig from './GeneralRackRates/config';
import InventoryConfig from './Inventory/config';
import OperatingCosts from './OperatingCosts/configs';
import OriginsAndDestinations from './OriginsAndDestinations/config';
import PermitsConfig from './Permits/config';
import PriceGroupsConfig from './PriceGroups/config';
import PromosConfig from './Promos/config';
import ScalesConfig from './Scales/config';
import CreateServiceAreaConfig from './ServiceAreas/components/CreateServiceArea/config';
import ServiceAreasConfig from './ServiceAreas/components/ServiceAreasList/config';
import { type Config } from './types';

export const commonBusinessUnitConfig: Config<ISystemConfigurationTable>[] = isCore
  ? [GeneralRackRatesConfig, PriceGroupsConfig, PermitsConfig]
  : [GeneralRackRatesConfig, PriceGroupsConfig, PermitsConfig];

export const businessUnitConfig: Config<ISystemConfigurationTable>[] = isCore
  ? [...commonBusinessUnitConfig, PromosConfig, ServiceAreasConfig]
  : [...commonBusinessUnitConfig, PromosConfig, ServiceAreasConfig, InventoryConfig];

export const recyclingBusinessUnitConfig: Config<ISystemConfigurationTable>[] = [
  ...commonBusinessUnitConfig,
  ScalesConfig,
  OriginsAndDestinations,
];

export const businessUnitNoNavConfig: Config<ISystemConfigurationView>[] = [
  CreateServiceAreaConfig,
];

export const configs: Config<ISystemConfigurationTable>[] = [
  BusinessLinesConfigurationConfig,
  OperatingCosts,
];
