/* eslint-disable default-case */
import { CreditCardType } from '@root/modules/billing/types';

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
