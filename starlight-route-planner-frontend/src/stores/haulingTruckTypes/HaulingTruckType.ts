import { IHaulingTruckType, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { HaulingTruckTypeStore } from './HaulingTruckTypeStore';

export class HaulingTruckTypeItem extends BaseEntity implements IHaulingTruckType {
  id: number;
  description: string;
  active: boolean;

  store: HaulingTruckTypeStore;

  constructor(store: HaulingTruckTypeStore, entity: JsonConversions<IHaulingTruckType>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.description = entity.description;
    this.active = entity.active;
  }
}
