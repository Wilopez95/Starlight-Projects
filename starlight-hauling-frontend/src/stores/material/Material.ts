import { computed } from 'mobx';

import { IMaterial, JsonConversions } from '@root/types';
import { IResponseMaterial } from '@root/types/responseEntities';

import { BaseEntity } from '../base/BaseEntity';

import { MaterialStore } from './MaterialStore';

export class Material extends BaseEntity implements IMaterial {
  active: boolean;
  description: string;
  misc: boolean;
  manifested: boolean;
  recycle: boolean;
  yard: boolean;
  landfillCanOverride: boolean;
  store: MaterialStore;
  businessLineId: string;
  useForLoad: boolean;
  useForDump: boolean;
  equipmentItemIds?: number[];
  code?: string;

  constructor(store: MaterialStore, entity: JsonConversions<IResponseMaterial>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
    this.misc = entity.misc;
    this.manifested = entity.manifested;
    this.equipmentItemIds = entity.equipmentItemIds;
    this.recycle = entity.recycle;
    this.yard = entity.yard;
    this.landfillCanOverride = entity.landfillCanOverride;
    this.useForLoad = entity.useForLoad;
    this.useForDump = entity.useForDump;
    this.businessLineId = entity.businessLineId;
    this.code = entity.code;
  }

  @computed
  get equipmentItems() {
    return this.store.globalStore.equipmentItemStore.values.filter(equipmentItem =>
      this.equipmentItemIds?.includes(equipmentItem.id),
    );
  }

  @computed
  get equipmentItemsDescriptions() {
    return this.equipmentItems
      .map(equipmentItem => equipmentItem.description)
      .sort()
      .join(' / ');
  }
}
