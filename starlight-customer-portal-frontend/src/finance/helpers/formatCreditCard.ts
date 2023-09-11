import { ICreditCard, INewCreditCard } from '@root/core/types';

import { getCreditCardBrand } from '../../core/helpers/creditCardBrand';

export const formatCreditCard = (creditCard?: ICreditCard | INewCreditCard) => {
  if (!creditCard) {
    return '';
  }

  if (creditCard.cardNickname) {
    return creditCard.cardNickname;
  }

  if (creditCard.cardType && creditCard.cardNumberLastDigits) {
    return `${getCreditCardBrand(creditCard.cardType)} •••• ${creditCard.cardNumberLastDigits}`;
  }

  return '';
};
