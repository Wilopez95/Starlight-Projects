import { INewOrderFormData } from '../types';

export const getOrderServiceTotal = (order: INewOrderFormData) => {
  return order.billableServiceQuantity * (Number(order.billableServicePrice) || 0);
};

export const getOrdersServiceTotal = (orders: INewOrderFormData[]) =>
  orders.reduce((acc, cur) => acc + getOrderServiceTotal(cur), 0);
