import { I3pHauler, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { HaulerStore } from './3pHaulerStore';

export class HaulerItem extends BaseEntity implements I3pHauler {
  id: number;
  description: string;
  active: boolean;

  store: HaulerStore;

  constructor(store: HaulerStore, entity: JsonConversions<I3pHauler>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.description = entity.description;
    this.active = entity.active;
  }
}
