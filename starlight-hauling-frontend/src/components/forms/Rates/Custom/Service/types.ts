import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateService } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IPriceGroupServiceFormikData {
  services: FormikPriceGroupRate<IPriceGroupRateService>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface IServiceForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
