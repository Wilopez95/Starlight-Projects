import { RequestQueryParams } from '@root/api/base';
import { BillingCycleEnum } from '@root/consts';

export interface RequestOptions {
  businessLineId?: number | string;
  businessLineIds?: number[];
  oneTime?: boolean;
  activeOnly?: boolean;
  populateIncluded?: boolean;
  billingCycle?: string;
  equipmentItemIds?: number[];
}

export interface RequestFrequenciesOptions extends RequestQueryParams {
  globalRateRecurringServiceId?: number;
  customRateRecurringServiceId?: number;
  billingCycle?: BillingCycleEnum | null;
}
