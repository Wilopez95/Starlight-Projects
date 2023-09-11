import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IServiceCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { FormikPriceGroupRate } from '../types';

export interface IServiceCustomRateFormikData {
  oneTimeService: FormikPriceGroupRate<IServiceCustomRate>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface IServiceForm {
  viewMode?: boolean;
  currentEquipmentItemNavigation?: NavigationConfigItem<string>;
  currentMaterialNavigation?: NavigationConfigItem;
  onMaterialChange(config: NavigationConfigItem): void;
  onEquipmentItemChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
