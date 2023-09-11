import { IBroker, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { BrokerStore } from './BrokerStore';

export class Broker extends BaseEntity implements IBroker {
  name: string;
  email: string;
  active: boolean;
  shortName: string;
  billing: 'broker' | 'customer';
  store: BrokerStore;

  constructor(store: BrokerStore, entity: JsonConversions<IBroker>) {
    super(entity);

    this.store = store;
    this.name = entity.name;
    this.email = entity.email;
    this.active = entity.active;
    this.shortName = entity.shortName;
    this.billing = entity.billing;
  }
}
