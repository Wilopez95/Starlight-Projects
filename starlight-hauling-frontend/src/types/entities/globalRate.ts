import { BillableItemActionEnum, BillingCycleEnum } from '@root/consts';
import { IBusinessContextIds, IFrequency, IFuturePrice } from '@root/types';

import { IEntity } from './entity';

export interface IRecurringLineItemBillingCycleRate extends IFuturePrice {
  billingCycle: BillingCycleEnum;
  price?: number | null;
}

export interface IGlobalRateEntityBase {
  billableServiceId: number;
  materialId?: number | null;
  equipmentItemId?: number;
}

export interface IGlobalRate extends IEntity, IBusinessContextIds {
  active: boolean;
  customerGroup: string;
  description: string;
  dateStart?: Date;
  dateEnd?: Date;
}

export interface IGlobalRateService extends IGlobalRateEntityBase, IBusinessContextIds, IEntity {
  price?: number;
}

export interface IGlobalRateRecurringService
  extends IGlobalRateEntityBase,
    IBusinessContextIds,
    IEntity {
  action: BillableItemActionEnum;
  billingCycle: BillingCycleEnum;
  price?: number;
  frequencies?: IFrequency[];
}

export interface IGlobalRateLineItem extends IEntity, IBusinessContextIds {
  lineItemId: number;
  materialId?: number;
  price?: number;
}

export interface IGlobalRateSurcharge extends IEntity, IBusinessContextIds {
  surchargeId: number;
  materialId?: number;
  price?: number;
}
export interface ICustomRateLineItem extends IEntity, IBusinessContextIds {
  customRatesGroupId: number;
  lineItemId: number;
  materialId: number | null;
  oneTime: boolean;
  price: number;
}

export interface ICustomRateSurcharge extends IEntity, IBusinessContextIds {
  customRatesGroupId: number;
  surchargeId: number;
  materialId: number | null;
  price: number;
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

export interface IGlobalRateServiceForm extends IGlobalRateEntityBase, IBusinessContextIds {
  price?: string;
  updatedAt?: string | Date;
  id?: number;
}

export interface IGlobalRateRecurringServiceForm
  extends IGlobalRateEntityBase,
    IBusinessContextIds {
  action: BillableItemActionEnum;
  billingCycle: BillingCycleEnum;
  price?: string;
  frequencies?: IFrequency[];
  updatedAt?: string | Date;
  id?: number;
}

export interface IGlobalRateLineItemForm extends IBusinessContextIds {
  lineItemId: number;
  materialId?: number;
  price?: string;
  updatedAt?: string | Date;
  id?: number;
}

export interface IGlobalRateRecurringLineItemForm extends IBusinessContextIds {
  lineItemId: number;
  billingCycles: IRecurringLineItemBillingCycleRate[];
  price?: string;
  updatedAt?: string | Date;
  id?: number;
}

export interface IGlobalRateSurchargeForm extends IBusinessContextIds {
  surchargeId: number;
  materialId?: number;
  price?: string;
  updatedAt?: string | Date;
  id?: number;
}

export interface IGlobalRateThresholdForm extends IBusinessContextIds {
  thresholdId: number;
  equipmentItemId?: number;
  materialId?: number;
  price?: string;
  limit?: number;
  updatedAt?: Date;
  id?: number;
}
