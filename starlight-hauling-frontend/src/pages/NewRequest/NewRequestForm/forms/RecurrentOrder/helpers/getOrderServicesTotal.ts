import { INewOrderFormData } from '../../Order/types';
import { INewRecurrentOrderFormData } from '../types';

export const getOrderServiceTotal = (order: INewRecurrentOrderFormData | INewOrderFormData) => {
  return order.billableServiceQuantity * (order.billableServicePrice ?? 0);
};
