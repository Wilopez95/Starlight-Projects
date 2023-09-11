import { addDays } from 'date-fns';

import type { PaymentTerms } from '../../../types';

export const calculateDueDate = (terms: PaymentTerms): Date => {
  const date = new Date();

  switch (terms) {
    case 'cod':
      return date;
    case 'net15Days':
      return addDays(date, 15);
    case 'net30Days':
      return addDays(date, 30);
    case 'net60Days':
      return addDays(date, 60);
    default:
      return date;
  }
};

export const getPaymentTermsDisplayString = (terms: PaymentTerms): string => {
  switch (terms) {
    case 'cod':
      return 'COD';
    case 'net15Days':
      return 'Net 15';
    case 'net30Days':
      return 'Net 30';
    case 'net60Days':
      return 'Net 60';
    default:
      return 'COD';
  }
};
