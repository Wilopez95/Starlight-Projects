import { format } from 'date-fns';

import { dateFormatsEnUS } from '@root/i18n/format/date';

import { CreatePayoutPayload } from '../../Payouts/api/types';
import { NewPayout } from '../../Payouts/types';

const getPaymentData = (data: NewPayout): Record<string, unknown> => {
  switch (data.paymentType) {
    case 'creditCard': {
      return {
        creditCardId: data.creditCardId,
        newCreditCard: data.newCreditCard,
      };
    }
    case 'check': {
      return {
        isAch: data.isAch,
        checkNumber: data.checkNumber,
      };
    }
    default: {
      return {};
    }
  }
};

export const sanitizePayout = (data: NewPayout): CreatePayoutPayload => {
  return {
    paymentIds: data.selectedPayments.map(payment => payment.id),
    date: format(data.date, dateFormatsEnUS.ISO),
    paymentType: data.paymentType,
    amount: data.amount,
    ...getPaymentData(data),
  };
};
