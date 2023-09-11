import { ICustomer } from '@root/types';

export interface ILinkedCustomers {
  jobSiteId?: number;
  onCustomerSelect(values: ICustomer): void;
}
