import { NavigationConfigItem } from '@starlightpro/shared-components';

import { ILineItemCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { FormikPriceGroupRate } from '../types';

export interface ILineItemCustomRateFormikData {
  oneTimeLineItem: FormikPriceGroupRate<ILineItemCustomRate>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface ILineItemForm {
  currentMaterialNavigation?: NavigationConfigItem;
  viewMode?: boolean;
  onMaterialChange(config: NavigationConfigItem): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
