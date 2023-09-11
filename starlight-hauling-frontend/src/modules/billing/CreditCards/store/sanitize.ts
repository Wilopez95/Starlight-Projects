/* eslint-disable @typescript-eslint/ban-ts-comment */
import { INewCreditCard } from '../types';

export const sanitizeCreditCard = (card: INewCreditCard) => {
  const { expirationMonth, expirationYear, ...data } = card;

  data.expirationDate = `${expirationMonth}${expirationYear}`;
  data.cardNumber = data.cardNumber.replace(/-/g, '');

  //@ts-expect-error
  delete data.isAutopay;
  //@ts-expect-error
  delete data.cardNumberLastDigits;
  //@ts-expect-error
  delete data.expDate;
  //@ts-expect-error
  delete data.cardType;

  return data;
};
