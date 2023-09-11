import { NavigationConfigItem } from '@starlightpro/shared-components';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateLineItem } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IPriceGroupRateLineItemFormikData {
  lineItems: FormikPriceGroupRate<IPriceGroupRateLineItem>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface ILineItemForm {
  currentMaterialNavigation?: NavigationConfigItem<string>;
  viewMode?: boolean;
  onMaterialChange(config: NavigationConfigItem<string>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
