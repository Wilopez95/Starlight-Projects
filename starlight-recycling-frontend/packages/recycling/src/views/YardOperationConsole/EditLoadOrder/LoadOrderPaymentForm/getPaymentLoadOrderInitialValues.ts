import { GetOrderQuery, PaymentMethodType } from '../../../../graphql/api';

export const getPaymentLoadOrderInitialValues = (order: GetOrderQuery['order']) => ({
  orderId: order.id,
  paymentMethod:
    order.paymentMethod ||
    (order.customer.onAccount ? PaymentMethodType.OnAccount : PaymentMethodType.CreditCard),
  priceGroupId: order.priceGroupId,
  creditCardId: order.creditCardId,
  billableItems: order.billableItems,
  material: order.material,
  destinationId: order.destination?.id,
  taxTotal: order.taxTotal,
  amount: order.amount,
  isAch: order.isAch,
  checkNumber: order.checkNumber,
  weightTicketUrl: order.weightTicketUrl,
  beforeTaxesTotal: order.beforeTaxesTotal,
  grandTotal: order.grandTotal,
});
