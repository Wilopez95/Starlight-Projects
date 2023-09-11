import { ICustomerGroup } from '@root/types';

import { BaseService } from '../base';

export class CustomerGroupService extends BaseService<ICustomerGroup> {
  constructor() {
    super('customer-groups');
  }
}
