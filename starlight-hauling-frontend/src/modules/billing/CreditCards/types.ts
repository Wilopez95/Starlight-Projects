import { type IAddress, type IEntity, type PaymentGateway } from '../../../types';

export interface ICreditCard extends IEntity, Omit<IAddress, 'region'> {
  customerId: number;
  active: boolean;
  cardNickname: string | null;
  cardType: CreditCardType;
  paymentGateway: PaymentGateway;
  cardNumberLastDigits: string;
  jobSites: number[] | null;
  nameOnCard: string;
  expDate: Date | string;
  expirationDate: string; // date format: mmyy
  expiredLabel: boolean;
  isAutopay: boolean;
  spUsed: boolean;
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
  extends Omit<
    ICreditCard,
    'paymentGateway' | 'expiredLabel' | 'cardNickname' | 'createdAt' | 'updatedAt' | 'spUsed'
  > {
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  cardNumber: string;
  cardNickname: string;
}

export type CreditCardSortType =
  | 'ID'
  | 'STATUS'
  | 'CARD_NICKNAME'
  | 'CARD_NUMBER'
  | 'CARD_TYPE'
  | 'EXPIRATION_DATE'
  | 'PAYMENT_GATEWAY';
