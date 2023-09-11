import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateSurcharge } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IPriceGroupRateSurchargeFormikData {
  surcharges: FormikPriceGroupRate<IPriceGroupRateSurcharge>[];
}

export interface ISurchargeForm {
  currentMaterialNavigation?: NavigationConfigItem<string>;
  viewMode?: boolean;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
