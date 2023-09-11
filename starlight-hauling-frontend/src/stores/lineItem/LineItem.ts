import { BillingCycleEnum } from '@root/consts';
import { BillableLineItemType, BillableUnitType, ILineItem, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { LineItemStore } from './LineItemStore';

export class LineItem extends BaseEntity implements ILineItem {
  type?: BillableLineItemType;
  active: boolean;
  description: string;
  unit?: BillableUnitType;
  oneTime: boolean;
  applySurcharges: boolean;
  businessLineId: string;
  billingCycles?: BillingCycleEnum[];
  materialBasedPricing?: boolean;
  materialIds?: number[];

  store: LineItemStore;

  constructor(store: LineItemStore, entity: JsonConversions<ILineItem>) {
    super(entity);

    this.store = store;
    this.type = entity.type;
    this.active = entity.active;
    this.description = entity.description;
    this.unit = entity.unit;
    this.oneTime = entity.oneTime;
    this.businessLineId = entity.businessLineId;
    this.billingCycles = entity.billingCycles;
    this.materialBasedPricing = entity.materialBasedPricing;
    this.applySurcharges = entity.applySurcharges;
    this.materialIds = entity.materialIds;
  }
}
