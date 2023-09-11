import { BillingCycleEnum } from '@root/consts';
import { IFrequency } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

import { IFutureCustomRate } from '../CustomRate/types';

export interface IRecurringLineItemBillingCycleRate extends IFutureCustomRate {
  billingCycle: BillingCycleEnum;
  price: number | null;
}

export interface IServiceGeneralRate extends IBusinessContextIds {
  equipmentItemId: number;
  billableServiceId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}

export interface IRecurringServiceGeneralRate extends IBusinessContextIds {
  billableServiceId: number;
  equipmentItemId: number;
  materialId: number | null;
  price: number | null;
  billingCycle: BillingCycleEnum | null;
  id?: number;
  frequencyId?: number;
  frequencies?: IFrequency[];
}

export interface ILineItemGeneralRate extends IBusinessContextIds {
  billableLineItemId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}
export interface IRecurringLineItemGeneralRate extends IBusinessContextIds {
  billableLineItemId: number;
  billingCycle: BillingCycleEnum | null | IRecurringLineItemBillingCycleRate[];
  price: number | null;
  id?: number;
}

export interface ISurchargeGeneralRate extends IBusinessContextIds {
  surchargeId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}

export interface IThresholdGeneralRate extends IBusinessContextIds {
  thresholdId: number;
  price: number | null;
  id?: number;
  limit?: number;
}
