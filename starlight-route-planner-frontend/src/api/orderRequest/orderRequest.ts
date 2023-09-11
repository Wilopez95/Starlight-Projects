import { IOrderRequest } from '@root/types';
import { BaseService } from '../base';

import { OrderRequestStoreCountResponse } from './types';

export class OrderRequestService extends BaseService<
  IOrderRequest,
  IOrderRequest,
  OrderRequestStoreCountResponse
> {
  constructor() {
    super('orders/requests');
  }
}
