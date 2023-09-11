import { BillingCycle } from '@root/core/consts';
import { IBusinessContextIds, IFrequency } from '@root/core/types';

import { BillableServiceActionType } from './billableService';
import { IEntity } from './entity';

export interface IRecurringLineItemBillingCycleRate {
  billingCycle: BillingCycle;
  price?: number;
}

export interface IGlobalRate extends IEntity, IBusinessContextIds {
  active: boolean;
  customerGroup: string;
  description: string;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface IGlobalRateService extends IEntity, IBusinessContextIds {
  billableServiceId: number;
  materialId?: number;
  equipmentItemId?: number;
  price?: number;
}

export interface IGlobalRateRecurringService extends IEntity, IBusinessContextIds {
  billableServiceId: number;
  action: BillableServiceActionType;
  billingCycle: BillingCycle;
  materialId?: number;
  equipmentItemId?: number;
  price?: number;
  frequencies?: IFrequency[];
}

export interface IGlobalRateLineItem extends IEntity, IBusinessContextIds {
  lineItemId: number;
  price?: number;
}

export interface IGlobalRateRecurringLineItem extends IEntity, IBusinessContextIds {
  lineItemId: number;
  billingCycles: IRecurringLineItemBillingCycleRate[];
  price?: number;
}

export interface IGlobalRateThreshold extends IEntity, IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
  price?: number;
  limit?: number;
}
