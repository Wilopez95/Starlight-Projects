import { IEntity, IPhoneNumber } from './';

export type AprType = 'standard' | 'custom';
export type BillingCycle = 'daily' | 'weekly' | 'monthly';
export type PaymentTerms = 'cod' | 'net15Days' | 'net30Days' | 'net60Days';
export type InvoiceConstruction = 'byOrder' | 'byAddress' | 'byCustomer';

export enum CustomerPaymentType {
  PREPAID = 'PREPAID',
  ON_ACCOUNT = 'ON_ACCOUNT',
}

export interface ICustomer extends IEntity {
  name: string;
  firstName: string;
  lastName: string;
  phoneNumbers: IPhoneNumber[];
  mainFirstName: string;
  mainLastName: string;
}
