import { LineItems } from '../database/entities/tenant/LineItems';
import { ICustomRateLineItem } from './CustomRatesGroupLineItems';
import { IEntity } from './Entity';
import { IGlobalRateLineItem } from './GlobalRateLineItem';
import { IMaterial } from './Material';

export enum BillingCycleEnum {
  daily = 'daily',
  weekly = 'weekly',
  _28days = '28days',
  monthly = 'monthly',
  quarterly = 'quarterly',
  yearly = 'yearly',
}
export interface ILineItemsResolver {
  order_id: number;
  price_id: number;
}

export interface IWhereLineItems {
  id?: number | null;
  price_id?: number | null;
  order_id?: number | null;
}

export interface IUpsertLineItems extends LineItems {
  priceToDisplay: number;
}
export interface ILineItem extends IEntity {
  active: boolean;
  description: string;
  oneTime: boolean;
  businessLineId: string;
  applySurcharges: boolean;
  type?: string;
  unit?: string;
  billingCycles?: BillingCycleEnum[];
  materialBasedPricing?: boolean;
  originalId?: number;
  materialIds?: number[];
}

export interface IOrderIncludedLineItem extends IOrderLineItem {
  globalRatesLineItem?: IGlobalRateLineItem;
  billableLineItem?: ILineItem;
}

export interface IOrderLineItem extends IEntity {
  billableLineItemId: number;
  quantity: number;
  globalRatesLineItemsId?: number | null;
  customRatesGroupLineItemsId?: number | null;
  applySurcharges: boolean;
  price?: number;
  nextPrice?: number;
  materialId?: number | null;
  billableLineItem?: ILineItem;
  globalRatesLineItem?: IGlobalRateLineItem;
  customRatesGroupLineItem?: ICustomRateLineItem;
  material?: IMaterial;
  effectiveDate?: Date | null;
  manifestNumber?: string;
  units?: string;
}
