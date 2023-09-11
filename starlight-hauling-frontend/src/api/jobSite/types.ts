import { RequestQueryParams } from '../base/types';

export interface IRequestByCustomerOptions extends RequestQueryParams {
  customerId: string | number;
}

export interface IRequestByCustomerByIdOptions extends IRequestByCustomerOptions {
  id: string | number;
}
