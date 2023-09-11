import { IAddress } from './Address';
import { IBroker } from './Broker';
import { IEntity } from './Entity';
import { IPurchaseOrder } from './PurchaseOrder';
import {
  IProcessSubscriptionsDraft,
  ISubscriptionExtends,
  TypeInvoiceConstruction,
} from './Subscriptions';

export type AprType = 'standard' | 'custom';
export type PaymentTerms = 'cod' | 'net15Days' | 'net30Days' | 'net60Days';
export type InvoiceConstruction = 'byOrder' | 'byAddress' | 'byCustomer';
export type PhoneNumberType = 'main' | 'home' | 'work' | 'cell' | 'other';
export enum AutopayEnum {
  invoiceDue = 'invoiceDue',
  lastInvoice = 'lastInvoice',
  accountBalance = 'accountBalance',
}
export enum CustomerStatus {
  active = 'active',
  onHold = 'onHold',
  inactive = 'inactive',
}

export interface IPhoneNumber {
  id: number;
  type: PhoneNumberType;
  number: string;
  textOnly?: boolean;
  extension?: string;
}

export interface ICustomer extends IEntity {
  addFinanceCharges: boolean;
  alternateId: string | null;
  aprType: AprType;
  attachMediaPref: boolean;
  attachTicketPref: boolean;
  balance: number;
  billingAddress: IAddress;
  billingCycle: string;
  businessName: string;
  businessUnitId: number;
  customerGroupId: number;
  email: string;
  financeCharge: number | null;
  firstName: string;
  generalNote: string;
  invoiceConstruction: InvoiceConstruction;
  lastName: string;
  mailingAddress: IAddress;
  notificationEmails: string[];
  onAccount: boolean;
  paymentTerms: PaymentTerms;
  phoneNumbers: IPhoneNumber[];
  popupNote: string;
  billingNote: string;
  workOrderNote: string;
  poRequired: boolean;
  sendInvoicesByEmail: boolean;
  sendInvoicesByPost: boolean;
  signatureRequired: boolean;
  statementEmails: string[];
  status: CustomerStatus;
  workOrderRequired: boolean;
  jobSiteRequired: boolean;
  canTareWeightRequired: boolean;
  gradingRequired: boolean;
  gradingNotification: boolean;
  selfServiceOrderAllowed: boolean;
  spUsed: boolean;
  name: string;
  walkup?: boolean;
  isAutopayExist?: boolean;
  autopayType?: AutopayEnum;
  autopayCreditCardId?: string | number;
  invoiceEmails?: string[];
  contactId?: number;
  creditLimit?: number;
  mainEmail?: string;
  mainFirstName?: string;
  mainJobTitle?: string | null;
  mainLastName?: string;
  mainPhoneNumbers?: IPhoneNumber[];
  owner?: IBroker;
  ownerId?: number;
  salesId?: number;
  mainCustomerPortalUser?: boolean;
  customerPortalUser?: boolean;
  purchaseOrders?: IPurchaseOrder[] | null;
  activeSubscriptionsCount?: number;
  originalId?: number;
}

export interface IProceedCustomers {
  subscriptions: ISubscriptionExtends[];
  invoiceConstruction: TypeInvoiceConstruction;
}

export interface ICustomerInvoicingInfo {
  invoiceConstruction: TypeInvoiceConstruction;
  drafts: IProcessSubscriptionsDraft[];
  invoicesCount: number;
  invoicesTotal: number;
  proceedSubscriptions: number;
  generatedInvoices: number;
}
