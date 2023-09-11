import { startCase } from 'lodash-es';

import { ManuallyCreatablePayment } from '@root/modules/billing/types';

import { formatCreditCard } from './formatCreditCard';

export const formatPaymentType = (payment: ManuallyCreatablePayment) => {
  const formattedType = startCase(payment.paymentType);

  switch (payment.paymentType) {
    case 'creditMemo':
    case 'writeOff': {
      return '-';
    }
    case 'check': {
      return `${formattedType} #${payment.checkNumber ?? ''}`;
    }
    case 'creditCard': {
      if (payment.creditCard) {
        const formattedCreditCard = formatCreditCard(payment.creditCard);

        if (formattedCreditCard) {
          return formattedCreditCard;
        }
      }

      return formattedType;
    }

    default:
      return formattedType;
  }
};
