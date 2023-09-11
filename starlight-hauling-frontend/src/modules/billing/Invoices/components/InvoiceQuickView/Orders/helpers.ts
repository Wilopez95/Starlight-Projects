import { IInvoiceOrder } from '../../../types';

export const getOrderService = (order: IInvoiceOrder) => {
  return order.lineItems.find(lineItem => lineItem.isService)?.description;
};
