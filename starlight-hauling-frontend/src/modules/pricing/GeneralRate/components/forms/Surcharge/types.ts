import { NavigationConfigItem } from '@starlightpro/shared-components';

import { ISurchargeGeneralRate } from '@root/modules/pricing/GeneralRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

export interface ISurchargeGeneralRateFormikData {
  surcharge: ISurchargeGeneralRate[];
}
export interface ISurchargeForm {
  currentMaterialNavigation?: NavigationConfigItem<string | null>;
  onMaterialChange(config: NavigationConfigItem<string | null>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
