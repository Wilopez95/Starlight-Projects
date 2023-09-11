import { type FormikCustomerWithInvoiceDrafts } from '../../types';

export interface ICreatePayment {
  currentCustomer: FormikCustomerWithInvoiceDrafts;
  onPaymentCanceled(): void;
  onPaymentCreated(orderIds: number[]): void;
}
