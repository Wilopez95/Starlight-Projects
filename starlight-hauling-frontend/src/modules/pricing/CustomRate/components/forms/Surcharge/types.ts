import { NavigationConfigItem } from '@starlightpro/shared-components';

import { ISurchargeCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { FormikPriceGroupRate } from '../types';

export interface ISurchargeCustomRateFormikData {
  surcharge: FormikPriceGroupRate<ISurchargeCustomRate>[];
}

export interface ISurchargeForm {
  currentMaterialNavigation?: NavigationConfigItem<string | null>;
  viewMode?: boolean;
  onMaterialChange(config: NavigationConfigItem<string | null>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
