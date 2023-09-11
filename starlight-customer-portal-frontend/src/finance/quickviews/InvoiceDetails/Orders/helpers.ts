import { IInvoiceOrder } from '@root/finance/types/entities';

export const getOrderService = (order: IInvoiceOrder) => {
  return order.lineItems.find((lineItem) => lineItem.isService)?.description;
};
