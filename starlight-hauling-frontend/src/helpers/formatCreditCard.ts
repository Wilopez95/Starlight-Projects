import { ICreditCard, INewCreditCard } from '@root/modules/billing/types';

import { getCreditCardBrand } from './creditCardBrand';

export const formatCreditCard = (creditCard?: ICreditCard | INewCreditCard) => {
  if (!creditCard) {
    return '';
  }

  if (creditCard.cardNickname) {
    return creditCard.cardNickname;
  }

  if (creditCard.cardNumberLastDigits) {
    return `${getCreditCardBrand(creditCard.cardType)} •••• ${creditCard.cardNumberLastDigits}`;
  }

  return '';
};
