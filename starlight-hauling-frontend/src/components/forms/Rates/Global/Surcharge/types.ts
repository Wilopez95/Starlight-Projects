import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IGlobalRateSurcharge } from '@root/types';

export interface IGlobalRateSurchargeFormikData {
  surcharges: IGlobalRateSurcharge[];
}
export interface ISurchargeForm {
  currentMaterialNavigation?: NavigationConfigItem<string>;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
