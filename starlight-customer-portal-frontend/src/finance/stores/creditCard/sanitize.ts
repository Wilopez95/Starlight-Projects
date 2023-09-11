import { INewCreditCard } from '@root/core/types';

export const sanitizeCreditCard = (card: INewCreditCard) => {
  const { expirationMonth, expirationYear, ...data } = card;

  data.expirationDate = `${expirationMonth}${expirationYear}`;
  data.cardNumber = data.cardNumber && data.cardNumber.replace(/-/g, '');

  delete data.cardNumberLastDigits;
  delete data.expDate;
  delete data.cardType;

  return data;
};
