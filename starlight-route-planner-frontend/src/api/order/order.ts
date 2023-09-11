import { OrderStoreCountResponse } from '@root/stores/order/types';
import { IOrder } from '@root/types';

import { BaseService } from '../base';

const baseUrl = 'orders';

export class OrderService extends BaseService<IOrder, IOrder, OrderStoreCountResponse> {
  constructor() {
    super(baseUrl);
  }
}
