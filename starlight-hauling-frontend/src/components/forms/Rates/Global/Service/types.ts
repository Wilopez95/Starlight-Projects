import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IGlobalRateService } from '@root/types';

export interface IGlobalRateServiceFormikData {
  services: IGlobalRateService[];
}

export interface IServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem<string>;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
