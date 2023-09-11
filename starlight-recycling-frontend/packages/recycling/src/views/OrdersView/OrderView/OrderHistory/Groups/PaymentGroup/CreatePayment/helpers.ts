import { CreditCard } from '../../../../../../../graphql/api';
import { CreditCardType } from './types';

export const getSubject = (status: any) => {
  switch (status) {
    case 'deferred':
      return 'Deferred payment';
    case 'authorized':
      return 'Authorized amount';
    default:
      return 'Created payment';
  }
};

export const formatCreditCard = (creditCard?: CreditCard) => {
  if (!creditCard) {
    return '';
  }

  if (creditCard.cardNickname) {
    return creditCard.cardNickname;
  }

  if (creditCard.cardType && creditCard.cardNumberLastDigits) {
    return `${getCreditCardBrand(creditCard.cardType as CreditCardType)} •••• ${
      creditCard.cardNumberLastDigits
    }`;
  }

  return '';
};

export const getCreditCardBrand = (cardType: CreditCardType) => {
  switch (cardType) {
    case 'AMEX':
      return 'American Express';
    case 'BML':
      return 'Bill Me Later';
    case 'DNR':
      return 'Diners';
    case 'DSCV':
      return 'Discover';
    case 'JCB':
      return 'Japan Credit Bureau';
    case 'MC':
      return 'MasterCard';
    case 'RM':
      return 'Revolution Money';
    case 'TEL':
      return 'Telecheck';
    case 'UNKN':
      return 'Unknown';
    case 'VISA':
      return 'Visa';
    case 'VYGR':
      return 'Voyager';
    case 'WEX':
      return 'Wright Express';
  }
};
