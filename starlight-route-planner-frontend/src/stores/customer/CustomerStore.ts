import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { CustomerService } from '@root/api';
import { CustomerStoreCountResponse, ICustomer } from '@root/types';

import { BaseStore } from '../base/BaseStore';
import GlobalStore from '../GlobalStore';

import { Customer } from './Customer';

export class CustomerStore extends BaseStore<ICustomer> {
  private readonly service: CustomerService;

  @observable counts?: CustomerStoreCountResponse;
  @observable currentCustomer: ICustomer | null;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new CustomerService();
    this.currentCustomer = null;
  }

  @action
  setCurrentCustomer(customer: ICustomer | null) {
    this.currentCustomer = customer;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;

    try {
      const customerResponse = await task(this.service.getById(id));

      this.setCurrentCustomer(new Customer(this, customerResponse));
    } catch (error) {
      console.error('Customer Request By Id Error:', error);
    } finally {
      this.loading = false;
    }
  }
}
