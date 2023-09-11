import { IRecurringLineItemCustomRate } from '@root/modules/pricing/CustomRate/types';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';

import { FormikPriceGroupRate } from '../types';

export interface IRecurringLineItemCustomRateFormikData {
  recurringLineItem: FormikPriceGroupRate<IRecurringLineItemCustomRate>[];
  bulkEnabled?: boolean;
  bulkOperation?: boolean;
  bulkValue?: string;
}

export interface ILineItemForm {
  viewMode?: boolean;
  onShowRatesHistory(ratesHistoryParams: IRatesHistoryRequest, subTitle?: string): void;
}
