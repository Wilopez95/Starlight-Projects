import { ICustomer } from '@root/customer/types';

export interface IResponseCustomer extends ICustomer {
  owner: any; // todo: define type
}
