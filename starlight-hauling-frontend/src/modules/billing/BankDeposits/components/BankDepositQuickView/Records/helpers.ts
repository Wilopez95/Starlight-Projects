import { startCase } from 'lodash-es';

import { formatCreditCard } from '../../../../../../helpers';
import { type GeneralPayment } from '../../../../Payments/types';

export const generateDescription = (payment: GeneralPayment): string => {
  const type = startCase(payment.paymentType);
  let id = '';

  if (payment.paymentType === 'check') {
    id = payment.checkNumber ? `#${payment.checkNumber}` : '';
  } else if (payment.paymentType === 'creditCard') {
    id = payment.creditCard ? formatCreditCard(payment.creditCard) : '';
  }

  return `${type}${id ? ` ${id}` : ''}`;
};
