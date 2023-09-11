import { BillingCycleEnum } from '@root/consts';
import { IFrequency, ILineItemBillingCycleRate } from '@root/types';
import { IBusinessContextIds } from '@root/types/base/businessContext';

export interface IRecurringLineItemBillingCycleRate extends IFutureCustomRate {
  billingCycle: BillingCycleEnum;
  price: number | null;
}

export interface IServiceCustomRate extends IBusinessContextIds {
  equipmentItemId: number;
  billableServiceId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}

export interface IRecurringServiceCustomRate extends IBusinessContextIds {
  globalRateId: number | undefined;
  billableServiceId: number;
  equipmentItemId: number;
  materialId: number | null;
  price: number | null;
  billingCycle?: BillingCycleEnum | null;
  id?: number;
  frequencyId?: number;
  frequencies?: IFrequency[];
}

export interface ILineItemCustomRate extends IBusinessContextIds {
  billableLineItemId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}
export interface IRecurringLineItemCustomRate extends IBusinessContextIds {
  value?: string | number | null;
  billableLineItemId: number;
  billingCycles: ILineItemBillingCycleRate[];
  price: number | null;
  id?: number;
  nextPrice?: number | null;
  effectiveDate?: string | null;
}

export interface ISurchargeCustomRate extends IBusinessContextIds {
  surchargeId: number;
  price: number | null;
  materialId: number | null;
  id?: number;
}

export interface IThresholdCustomRate extends IBusinessContextIds {
  thresholdId: number;
  price: number | null;
  id?: number;
  limit?: number;
}

export interface IFutureCustomRate {
  nextPrice: number | null;
  effectiveDate?: Date | null;
}
