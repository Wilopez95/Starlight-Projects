import type { IAddress, ICustomerGroup } from '@root/core/types';

import type { IBusinessUnit, IEntity } from '../../../core/types/entities';

export type AprType = 'standard' | 'custom';
export type BillingCycle = 'daily' | 'weekly' | 'monthly';
export type PaymentTerms = 'cod' | 'net15Days' | 'net30Days' | 'net60Days';
export type InvoiceConstruction = 'byOrder' | 'byAddress' | 'byCustomer';

export interface ICustomer extends IEntity {
  addFinanceCharges: boolean;
  alternateId: string | null;
  aprType: AprType;
  attachMediaPref: boolean;
  attachTicketPref: boolean;
  balance: number;
  billingAddress: IAddress;
  billingCycle: BillingCycle;
  businessName: string;
  businessUnitId: number;
  customerGroup: ICustomerGroup;
  customerGroupId: number;
  email: string;
  financeCharge: number | null;
  firstName: string;
  generalNote: string;
  invoiceConstruction: InvoiceConstruction;
  invoiceEmails: string[];
  lastName: string;
  mailingAddress: IAddress;
  notificationEmails: string[];
  onAccount: boolean;
  paymentTerms: PaymentTerms;
  phoneNumbers: any[]; // todo: define type
  popupNote: string;
  poRequired: boolean;
  sendInvoicesByEmail: boolean;
  sendInvoicesByPost: boolean;
  signatureRequired: boolean;
  statementEmails: string[];
  onHold: boolean;

  businessUnit: IBusinessUnit;

  contactId?: number;
  creditLimit?: number;
  mainEmail?: string;
  mainFirstName?: string;
  mainJobTitle?: string | null;
  mainLastName?: string;
  mainPhoneNumbers?: any[]; // todo: define type
  name?: string; //TODO: consider making it required
  owner?: any; // todo: define type
  ownerId?: number;
  salesId?: number;
  contactPerson?: string;
  mainCustomerPortalUser?: boolean;
  customerPortalUser?: boolean;
}
