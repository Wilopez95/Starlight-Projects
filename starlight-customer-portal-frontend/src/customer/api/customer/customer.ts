import { BaseService, haulingHttpClient } from '@root/core/api/base';
import { IResponseCustomer } from '@root/core/types/responseEntities';
import type { CustomerStoreCount } from '@root/customer/stores/customer/type';
import { ICustomer } from '@root/customer/types';

export class CustomerService extends BaseService<ICustomer, IResponseCustomer, CustomerStoreCount> {
  constructor() {
    super('customers');
  }

  checkDuplicate(data: Partial<ICustomer>) {
    return haulingHttpClient.post<Partial<IResponseCustomer>>(
      `${this.baseUrl}/search/customer-duplicates`,
      data,
    );
  }
}
