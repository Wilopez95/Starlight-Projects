import { actionAsync, task } from 'mobx-utils';

import { CustomerGroupService } from '@root/api';

import { BaseStore } from '../base/BaseStore';
import type GlobalStore from '../GlobalStore';

import { CustomerGroup } from './CustomerGroup';

export class CustomerGroupStore extends BaseStore<CustomerGroup> {
  private readonly service: CustomerGroupService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new CustomerGroupService();
  }

  @actionAsync
  async request() {
    this.loading = true;

    try {
      const customerGroups = await task(this.service.get());

      this.setItems(customerGroups.map(group => new CustomerGroup(this, group)));
    } catch (error) {
      console.error('CustomerGroup Request Error', error);
    }

    this.loading = false;
  }
}
