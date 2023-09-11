import { BillableLineItemUnitTypeEnum, BillingCycleEnum } from '@root/consts';

import { IEntity } from './entity';

export interface ILineItem extends IEntity {
  active: boolean;
  description: string;
  oneTime: boolean;
  businessLineId: string;
  applySurcharges: boolean;
  type?: BillableLineItemType;
  unit?: BillableUnitType;
  billingCycles?: BillingCycleEnum[];
  materialBasedPricing?: boolean;
  originalId?: number;
  materialIds?: number[];
}

export type BillableLineItemType =
  | 'none'
  | 'manifestedDisposalByTon'
  | 'manifestedDisposalByYard'
  | 'tripCharge'
  | 'chargeback'
  | 'writeOff'
  | 'salesTax'
  | 'financeCharge'
  | 'deposit'
  | 'miscellaneousItem';

export type BillableUnitType =
  | BillableLineItemUnitTypeEnum.NONE
  | BillableLineItemUnitTypeEnum.EACH
  | BillableLineItemUnitTypeEnum.TON
  | BillableLineItemUnitTypeEnum.YARD
  | BillableLineItemUnitTypeEnum.GALLON
  | BillableLineItemUnitTypeEnum.MILE
  | BillableLineItemUnitTypeEnum.MIN
  | BillableLineItemUnitTypeEnum.HOUR
  | BillableLineItemUnitTypeEnum.DAY;
