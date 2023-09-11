import { BaseService } from '@root/core/api/base';
import { OrderStoreCountResponse } from '@root/orders-and-subscriptions/stores/order/types';

const baseUrl = 'orders';

export class OrderService extends BaseService<any, any, OrderStoreCountResponse> {
  constructor() {
    super(baseUrl);
  }
}
