export type NavigationKeys = 'payments' | 'payouts' | 'statements';

export type PaymentParams = {
  id: string;
};

export type CustomerPaymentsAndStatementsParams = {
  customerId: string;
  id?: string;
  subPath?: string;
};
