import { IOrderHistoryItem } from '../../../types';

export interface ICreatePayment {
  historyItem: IOrderHistoryItem;
}

export type CreditCardType =
  | 'MC'
  | 'VISA'
  | 'DSCV'
  | 'UNKN'
  | 'AMEX'
  | 'WEX'
  | 'VYGR'
  | 'TEL'
  | 'DNR'
  | 'JCB'
  | 'BML'
  | 'RM';
