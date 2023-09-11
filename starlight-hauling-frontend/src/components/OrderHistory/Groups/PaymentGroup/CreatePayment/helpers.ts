import { PaymentStatus } from '@root/modules/billing/types';

export const getSubject = (status: PaymentStatus) => {
  switch (status) {
    case 'deferred':
      return 'Deferred payment';
    case 'authorized':
      return 'Authorized amount';
    default:
      return 'Created payment';
  }
};
