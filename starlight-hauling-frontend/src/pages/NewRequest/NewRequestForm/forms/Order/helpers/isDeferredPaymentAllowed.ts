import { ClientRequestType } from '@root/consts';

import { type INewOrders, type IOrderPayment } from '../types';

export const isDeferredPaymentAllowed = (values: INewOrders, payment: IOrderPayment) =>
  values.orders.every(order => !!order.serviceDate) &&
  values.type === ClientRequestType.RegularOrder &&
  payment.paymentMethod === 'creditCard' &&
  (payment.creditCardId || payment.newCreditCard);
