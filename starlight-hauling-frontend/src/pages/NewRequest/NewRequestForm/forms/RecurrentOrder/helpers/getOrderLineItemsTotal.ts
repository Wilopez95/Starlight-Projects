import { calcPrice } from '@root/helpers';

import { INewOrderFormData } from '../../Order/types';
import { INewRecurrentOrderFormData } from '../types';

export const getOrderLineItemsTotal = (order: INewRecurrentOrderFormData | INewOrderFormData) => {
  return order.billableServiceQuantity * calcPrice(order.lineItems);
};
