import { BillingCycleEnum } from '@root/consts';

export type RequestOptions = {
  businessLineId?: number | string;
  businessLineIds?: number[];
  oneTime?: boolean;
  activeOnly?: boolean;
  billingCycle?: BillingCycleEnum;
};

export type CreateOptions = {
  duplicate?: boolean;
};
