import { substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import { IPurchaseOrder, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { PurchaseOrderStore } from './PurchaseOrderStore';

export class PurchaseOrder extends BaseEntity implements IPurchaseOrder {
  active: boolean;
  poNumber: string;
  poAmount: number | null;
  effectiveDate: Date | null;
  expirationDate: Date | null;
  businessLineIds: number[];
  customerId: string;
  isOneTime: boolean;
  levelApplied?: string[];

  store: PurchaseOrderStore;

  constructor(store: PurchaseOrderStore, entity: JsonConversions<IPurchaseOrder>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.poNumber = entity.poNumber;
    this.poAmount = entity.poAmount;
    this.effectiveDate = entity.effectiveDate
      ? substituteLocalTimeZoneInsteadUTC(entity.effectiveDate)
      : null;
    this.expirationDate = entity.expirationDate
      ? substituteLocalTimeZoneInsteadUTC(entity.expirationDate)
      : null;
    this.businessLineIds = entity.businessLineIds;
    this.customerId = entity.customerId;
    this.isOneTime = entity.isOneTime;
    this.levelApplied = entity.levelApplied;
  }
}
