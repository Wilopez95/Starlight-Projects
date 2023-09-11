import { PaymentMethod } from '@root/modules/billing/types';

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  creditCard: 'Credit Card',
  onAccount: 'On Account',
  cash: 'Cash',
  check: 'Check',
};
