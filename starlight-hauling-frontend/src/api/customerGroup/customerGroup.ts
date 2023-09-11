import { ICustomerGroup } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

export class CustomerGroupService extends BaseService<ICustomerGroup> {
  constructor() {
    super('customer-groups');
  }

  //billing Request
  static getCustomerGroupsById(ids: number[]) {
    return haulingHttpClient.post<
      {
        ids: number[];
      },
      Record<string, ICustomerGroup>
    >('customers/groups', {
      ids,
    });
  }
}
