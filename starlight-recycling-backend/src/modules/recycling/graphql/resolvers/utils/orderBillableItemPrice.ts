import { OrderBillableItem, OrderPriceSourceType } from '../../../entities/OrderBillableItem';

export type OrderBillableItemPrice = Pick<
  OrderBillableItem,
  'price' | 'priceSource' | 'priceSourceType'
>;

export const NO_PRICE: OrderBillableItemPrice = {
  price: 0,
  priceSource: null,
  priceSourceType: OrderPriceSourceType.NO_PRICE,
};
