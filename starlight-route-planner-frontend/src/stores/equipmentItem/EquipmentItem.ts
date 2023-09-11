import { IEquipmentItem, JsonConversions, EquipmentItemType } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { EquipmentItemStore } from './EquipmentItemStore';

export class EquipmentItem extends BaseEntity implements IEquipmentItem {
  type: EquipmentItemType;
  size: number | null;
  dispatchCode: string;
  imageUrl: string | null;
  shortDescription: string;
  description: string;
  length: number | null;
  width: number | null;
  height: number | null;
  emptyWeight: number | null;
  closedTop: boolean;
  active: boolean;
  businessLineId: number;
  customerOwned: boolean;
  store: EquipmentItemStore;

  constructor(store: EquipmentItemStore, entity: JsonConversions<IEquipmentItem>) {
    super(entity);

    this.store = store;
    this.type = entity.type;
    this.size = entity.size;
    this.dispatchCode = entity.dispatchCode;
    this.imageUrl = entity.imageUrl;
    this.shortDescription = entity.shortDescription;
    this.description = entity.description;
    this.length = entity.length;
    this.width = entity.width;
    this.height = entity.height;
    this.emptyWeight = entity.emptyWeight;
    this.closedTop = entity.closedTop;
    this.active = entity.active;
    this.businessLineId = entity.businessLineId;
    this.customerOwned = entity.customerOwned;
  }
}
