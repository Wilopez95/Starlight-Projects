import { CustomerStoreCount } from '@root/stores/customer/type';
import { ICustomer } from '@root/types';

import { BaseService } from '../base';

export class CustomerService extends BaseService<ICustomer, ICustomer, CustomerStoreCount> {
  constructor() {
    super('customers');
  }
}
