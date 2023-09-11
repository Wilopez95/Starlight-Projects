import { calcPrice } from '@root/helpers';

import { INewOrderFormData } from '../types';

export const getOrderLineItemsTotal = (order: INewOrderFormData) => {
  return order.billableServiceQuantity * calcPrice(order.lineItems);
};

export const getOrdersLineItemsTotal = (orders: INewOrderFormData[]) =>
  orders.reduce((acc, cur) => acc + getOrderLineItemsTotal(cur), 0);
