import { ICustomerGroup, JsonConversions, CustomerGroupType } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { CustomerGroupStore } from './CustomerGroupStore';

export class CustomerGroup extends BaseEntity implements ICustomerGroup {
  description: string;
  active: boolean;
  type: CustomerGroupType;
  store: CustomerGroupStore;

  constructor(store: CustomerGroupStore, entity: JsonConversions<ICustomerGroup>) {
    super(entity);

    this.store = store;
    this.description = entity.description;
    this.active = entity.active;
    this.type = entity.type;
  }
}
