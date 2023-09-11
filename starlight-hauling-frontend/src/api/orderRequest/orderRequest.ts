import { IOrderRequest } from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { IOrderRequestParams, OrderRequestStoreCountResponse } from './types';

export class OrderRequestService extends BaseService<
  IOrderRequest,
  IOrderRequest,
  OrderRequestStoreCountResponse
> {
  constructor() {
    super('orders/requests');
  }

  getOrdersRequests(params: IOrderRequestParams) {
    return haulingHttpClient.get<IOrderRequest[]>(this.baseUrl, params);
  }

  getCount(params: IOrderRequestParams) {
    return super.getCount(params);
  }
}
