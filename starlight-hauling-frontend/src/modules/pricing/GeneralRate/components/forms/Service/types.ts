import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IServiceGeneralRate } from '@root/modules/pricing/GeneralRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

export interface IServiceGeneralRateFormikData {
  oneTimeService: IServiceGeneralRate[];
}

export interface IServiceForm {
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
