import { BaseEntity } from '@root/stores/base/BaseEntity';
import { OrderRequestCount } from '@root/stores/orderRequest/types';

export interface IOrderRequestCount extends BaseEntity {
  count: OrderRequestCount;
}
