import { type PaymentMethod } from '@root/modules/billing/types';

export interface IChargePaymentData {
  paymentMethod: PaymentMethod;
  creditCardLabel: string;
  paymentAmount?: number;
  onSubmit(): void;
  onClose(): void;
}
