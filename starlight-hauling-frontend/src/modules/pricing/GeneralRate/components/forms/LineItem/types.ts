import { NavigationConfigItem } from '@starlightpro/shared-components';

import { ILineItemGeneralRate } from '@root/modules/pricing/GeneralRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

export interface ILineItemGeneralRateFormikData {
  oneTimeLineItem: ILineItemGeneralRate[];
}
export interface ILineItemForm {
  currentMaterialNavigation?: NavigationConfigItem<string | null>;
  onMaterialChange(config: NavigationConfigItem<string | null>): void;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}

export interface IRecurringLineItemForm {
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
