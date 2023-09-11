import { IMaterial, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { MaterialStore } from './MaterialStore';

export class Material extends BaseEntity implements IMaterial {
  active: boolean;
  description: string;
  misc: boolean;
  manifested: boolean;
  recycle: boolean;
  rolloff: boolean;
  businessLineId: number;
  equipmentItemIds?: number[];
  store: MaterialStore;

  constructor(store: MaterialStore, entity: JsonConversions<IMaterial>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.misc = entity.misc;
    this.manifested = entity.manifested;
    this.equipmentItemIds = entity.equipmentItemIds;
    this.recycle = entity.recycle;
    this.rolloff = entity.rolloff;
    this.businessLineId = entity.businessLineId;
  }
}
