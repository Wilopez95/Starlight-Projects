import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { IPriceGroupRateRecurringLineItem } from '@root/types';

import { FormikPriceGroupRate } from '../types';

export interface IPriceGroupRateRecurringLineItemFormikData {
  recurringLineItems: FormikPriceGroupRate<IPriceGroupRateRecurringLineItem>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface ILineItemForm {
  viewMode?: boolean;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
