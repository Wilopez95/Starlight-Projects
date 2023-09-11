import { IThirdPartyHauler, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { ThirdPartyHaulerStore } from './ThirdPartyHaulerStore';

export class ThirdPartyHauler extends BaseEntity implements IThirdPartyHauler {
  active: boolean;

  description: string;

  id: number;

  originalId: number;

  store: ThirdPartyHaulerStore;

  constructor(store: ThirdPartyHaulerStore, entity: JsonConversions<IThirdPartyHauler>) {
    super(entity);
    this.id = entity.id;
    this.originalId = entity.originalId;
    this.store = store;
    this.active = entity.active;
    this.description = entity.description;
  }
}
