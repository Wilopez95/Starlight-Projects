import { IAddress } from './address';
import { IEntity } from './index';

export interface ICreditCard extends IEntity, IAddress {
  customerId: number;
  active: boolean;
  cardNickname: string | null;
  cardType: CreditCardType;
  cardNumberLastDigits: string;
  jobSites: number[] | null;
  nameOnCard: string;
  expDate: number | Date;
  expirationDate: string; // date format: mmyy
  expiredLabel: boolean;
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

export interface INewCreditCard
  extends Omit<ICreditCard, 'expiredLabel' | 'cardNickname' | 'createdAt' | 'updatedAt'> {
  cvv?: string;
  expirationMonth?: string;
  expirationYear?: string;
  cardNumber?: string;
  cardNickname?: string;
}
