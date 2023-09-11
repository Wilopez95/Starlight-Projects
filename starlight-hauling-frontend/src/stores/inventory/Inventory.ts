import { IInventory, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { InventoryStore } from './InventoryStore';

export class Inventory extends BaseEntity implements IInventory {
  store: InventoryStore;

  businessUnitId: number;
  equipmentItemId: number;
  totalQuantity: number;
  onJobSiteQuantity: number;
  onRepairQuantity: number;
  description: string;

  constructor(store: InventoryStore, entity: JsonConversions<IInventory>) {
    super(entity);

    this.store = store;
    this.businessUnitId = entity.businessUnitId;
    this.equipmentItemId = entity.equipmentItemId;
    this.totalQuantity = +entity.totalQuantity;
    this.onJobSiteQuantity = +entity.onJobSiteQuantity;
    this.onRepairQuantity = +entity.onRepairQuantity;
    this.description = entity.description;
  }
}
