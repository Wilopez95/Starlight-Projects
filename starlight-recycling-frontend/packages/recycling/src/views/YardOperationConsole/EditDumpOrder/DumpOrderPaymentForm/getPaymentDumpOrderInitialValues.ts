import { GetOrderQuery, PaymentMethodType } from '../../../../graphql/api';

export const getPaymentDumpOrderInitialValues = (order: GetOrderQuery['order']) => ({
  orderId: order.id,
  paymentMethod:
    order.paymentMethod ||
    (order.customer.onAccount ? PaymentMethodType.OnAccount : PaymentMethodType.CreditCard),
  priceGroupId: order.priceGroupId,
  creditCardId: order.creditCardId,
  billableItems: order.billableItems,
  taxTotal: order.taxTotal,
  grandTotal: order.grandTotal,
  beforeTaxesTotal: order.beforeTaxesTotal,
  amount: order.amount,
  isAch: order.isAch,
  checkNumber: order.checkNumber,
  weightTicketUrl: order.weightTicketUrl,
  weightScaleUom: order.weightScaleUom || null,
});
