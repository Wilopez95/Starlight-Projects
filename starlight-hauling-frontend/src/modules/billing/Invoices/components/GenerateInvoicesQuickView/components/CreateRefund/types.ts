import { type FormikCustomerWithInvoiceDrafts } from '../../types';

export interface ICreateRefund {
  currentCustomer: FormikCustomerWithInvoiceDrafts;
  onRefundCanceled(): void;
  onRefundCreated(orderId: number, paymentId: number, amount: number): void;
}
