import { BillableLineItemUnitTypeEnum, BillingCycle } from '@root/core/consts';

import { IEntity } from './entity';

export interface ILineItem extends IEntity {
  active: boolean;
  description: string;
  oneTime: boolean;
  businessLineId: string;
  type?: BillableLineItemType;
  unit?: BillableUnitType;
  billingCycles?: BillingCycle[];
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
  | 'deposit';

export type BillableUnitType =
  | BillableLineItemUnitTypeEnum.NONE
  | BillableLineItemUnitTypeEnum.EACH
  | BillableLineItemUnitTypeEnum.TON
  | BillableLineItemUnitTypeEnum.YARD
  | BillableLineItemUnitTypeEnum.GALON
  | BillableLineItemUnitTypeEnum.MILE
  | BillableLineItemUnitTypeEnum.MIN
  | BillableLineItemUnitTypeEnum.HOUR
  | BillableLineItemUnitTypeEnum.DAY;
