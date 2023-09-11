import { AutopayEnum, BillingCycleEnum, CustomerStatus } from '@root/consts';
import { IInvoice, ManuallyCreatablePayment } from '@root/modules/billing/types';

import { type VersionedEntity } from '../helpers';

import {
  type IEntity,
  type IInvoicingSubscriptions,
  type IPhoneNumber,
  type IUnFinalizedSubscriptionOrder,
  IPurchaseOrder,
} from './';
import { type IAddress } from './address';
import { IBroker } from './broker';
import { type ICustomerGroup } from './customerGroup';
import { type IInvoicingOrder } from './order';

export type AprType = 'standard' | 'custom';
export type PaymentTerms = 'cod' | 'net15Days' | 'net30Days' | 'net60Days';
export type InvoiceConstruction = 'byOrder' | 'byAddress' | 'byCustomer';

export enum CustomerPaymentType {
  PREPAID = 'PREPAID',
  ON_ACCOUNT = 'ON_ACCOUNT',
}

export interface ICustomer extends IEntity {
  addFinanceCharges: boolean;
  alternateId: string | null;
  aprType: AprType;
  attachMediaPref: boolean;
  attachTicketPref: boolean;
  balance: number;
  billingAddress: IAddress;
  billingCycle: BillingCycleEnum;
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
}

export interface IOrdersInvoiceDraft {
  orders: IInvoicingOrder[];
  invoicesTotal: number;
  jobSiteId: number;
}

export interface ISubscriptionsInvoiceDraft {
  subscriptions: IInvoicingSubscriptions[];
  jobSiteId: number;
  invoicesTotal: number;
}

export interface IProblemOrder {
  id: number;
  grandTotal: number;
  customerId: number;
  capturedTotal: number;
  refundedAmount: number;
  creditCardId?: number;
}

export interface IOverlimitOrder extends IProblemOrder {
  availableCredit: number;
  overlimitAmount: number;
}

export interface IOverpaidOrder extends IProblemOrder {
  overpaidAmount: number;
  payments: ManuallyCreatablePayment[];
}

export interface ICustomerWithInvoiceDrafts extends ICustomer {
  invoicesTotal: number;
  invoicesCount: number;
  drafts: IOrdersInvoiceDraft[];
  customerGroup: Omit<VersionedEntity<ICustomerGroup>, 'createdAt' | 'updatedAt'>;
  overlimitOrders?: IOverlimitOrder[];
  overpaidOrders?: IOverpaidOrder[];
}

export interface ICustomerWithCommonInvoiceDrafts<T> {
  id: number;
  name?: string;
  billingAddress: IAddress;
  businessName: string;
  firstName: string;
  lastName: string;
  autopayType?: AutopayEnum;
  billingCycle: BillingCycleEnum;
  invoiceConstruction: InvoiceConstruction;
  isAutopayExist?: boolean;
  invoicesTotal: number;
  invoicesCount: number;
  attachTicketPref: boolean;
  attachMediaPref: boolean;
  onAccount: boolean;
  drafts: T;
  customerGroup: Omit<VersionedEntity<ICustomerGroup>, 'createdAt' | 'updatedAt'>;
  overlimitOrders?: IOverlimitOrder[];
  overpaidOrders?: IOverpaidOrder[];
  proceedSubscriptions?: number;
  billingState?: string;
  billingCity?: string;
  billingZip?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingNote?: string;
  unfinalizedOrders?: IUnFinalizedSubscriptionOrder[];
}

export interface ICustomerWithFinalChargeDraft extends ICustomer {
  financeCharge: number;
  financeChargeApr: number;
  invoices: IInvoice[];
  customerGroup: VersionedEntity<ICustomerGroup>;
}

export interface ICustomersResume {
  shouldUnholdTemplates: boolean;
}

export interface ICustomersOnHold {
  reason?: string;
  reasonDescription?: string | null;
  holdSubscriptionUntil?: Date | null;
}
