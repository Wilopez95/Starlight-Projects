import { CustomRatesGroupRecurringLineItemBillingCycle } from '../database/entities/tenant/CustomRatesGroupRecurringLineItemBillingCycle';
import { Context } from './Auth';
import { IEntity } from './Entity';
import { IWhere } from './GeneralsFilter';

export interface ICustomRatesGroupLineItems {
  id?: number;
  businessUnitId: number;
  businessLineId: number;
  oneTime: boolean;
  customRatesGroupId: number;
  lineItemId: number;
  materialId: number | null | undefined;
  price: number;
  effectiveDate: Date;
  nextPrice: number;
  createdAt: Date;
  updatedAt: Date;
  billingCycles: string[];
}
export interface IRepoCustomRatesGroupLineItems extends ICustomRatesGroupLineItems {
  billingCycles: string[];
}

export interface IUpsertManyCustomRatesGroupLineItems {
  where: IWhere;
  oldData: IRepoCustomRatesGroupLineItems[];
  ctx: Context;
}

export type IRatesToRemove = Pick<
  CustomRatesGroupRecurringLineItemBillingCycle,
  'billableLineItemBillingCycleId' | 'customRatesGroupRecurringLineItemId'
>;

export interface ICustomRateLineItem extends IEntity {
  customRatesGroupId: number;
  lineItemId: number;
  materialId: number | null;
  oneTime: boolean;
  price: number;
  businessUnitId: number;
  businessLineId: number;
  originalId: number;
}
