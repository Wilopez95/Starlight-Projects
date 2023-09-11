import type { IInvoiceBuilder } from '@starlightpro/invoice-builder';

import { BillingCycleEnum } from '@root/core/consts';
import { IEntity, Maybe } from '@root/core/types';
import { ManuallyCreatablePayment } from '@root/finance/types/entities/payment';
import { IBillingCustomer } from '@root/finance/types/queries';

export interface IInvoice extends IEntity {
  type: InvoiceType;
  csrName: string;
  csrEmail: string;
  total: number;
  balance: number;
  customer: Maybe<IBillingCustomer>;
  pdfUrl: Maybe<string>;
  writeOff: boolean;
  dueDate: Date | null;
  invoicedEntity?: IInvoiceOrder[] | IInvoiceSubscriptionResponse[];
  orders?: IInvoiceOrder[];
  payments?: ManuallyCreatablePayment[];
  emails?: IInvoiceEmail[];
  fine?: number;
  statementDate?: string;
  endStatementDate?: string;
  statementId?: number;
  businessLines: IInvoiceBusinessLine[];
}

export interface IInvoiceOrder {
  id: number;
  grandTotal: number;
  serviceDate: Date;
  lineItems: IInvoiceLineItem[];
}

export interface IInvoiceSubscriptionResponse extends IInvoiceSubscription {
  // todo: make optional, add non-service orders
  serviceItems: ISubscriptionInvoiceServiceItemResponse[];
}

export interface IInvoiceSubscriptionModel extends IInvoiceSubscription {
  // todo: make optional, add non-service orders
  serviceItems: ISubscriptionInvoiceServiceItemModel[];
  linkedSubscriptionOrder: ISubscriptionOrderInfo[];
}

interface IInvoiceSubscription {
  anniversaryBilling: boolean;
  billingCycle: BillingCycleEnum;
  billingType: string;
  businessLineId: string;
  totalPriceForSubscription: number;
  endDate: Date | null;
  id: string;
  nextBillingPeriodFrom: Date | null;
  nextBillingPeriodTo: Date | null;
  startDate: Date;
  nonServiceOrder: INonServiceOrder[];
}

export interface ISubscriptionInvoiceServiceItemResponse extends ISubscriptionInvoiceServiceItem {
  // todo: add Previous billing period adjustment
  serviceItems: ISubscriptionServiceItemResponse[];
}

export interface ISubscriptionInvoiceServiceItemModel extends ISubscriptionInvoiceServiceItem {
  // todo: add Previous billing period adjustment
  serviceItems: ISubscriptionServiceItem[];
  subscriptionOrders: ISubscriptionOrderInfo[];
}

export interface ISubscriptionInvoiceServiceItem {
  lineItems: ISubscriptionLineItem[];
  serviceItemId: string;
  serviceName: string;
}

export interface INonServiceOrder {
  id: string;
  serviceDate: Date;
  price: number;
  quantity: number;
  serviceName: string;
  grandTotal: number;
  subOrderLineItems: ISubscriptionOrderLineItemInfo[];
}

export interface ISubscriptionLineItem {
  id: string;
  price: number;
  quantity: number;
  totalPrice: number;
  periodTo: Date;
  periodSince: Date;
  serviceName: string;
  totalDay: number;
  usageDay: number;
}

export interface ISubscriptionServiceItemResponse extends ISubscriptionServiceItem {
  subscriptionOrders: ISubscriptionOrderInfo[];
}

export interface ISubscriptionServiceItem {
  id: string;
  periodSince: Date;
  periodTo: Date;
  price: number;
  quantity: number;
  totalDay: number;
  totalPrice: number;
  usageDay: number;
}

export interface ISubscriptionOrderInfo {
  id: string;
  serviceDate: Date;
  price: number;
  quantity: number;
  serviceName: string;
  subOrderLineItems?: ISubscriptionOrderLineItemInfo[];
}

export interface ISubscriptionOrderLineItemInfo {
  id: string;
  price: number;
  quantity: number;
  serviceName: string;
}

export const enum InvoiceEmailStatus {
  Pending = 'PENDING',
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  FailedToSend = 'FAILED_TO_SEND',
  FailedToDeliver = 'FAILED_TO_DELIVER',
}

export interface IInvoiceEmail extends IEntity {
  status: InvoiceEmailStatus;
  receiver: string;
}

interface IInvoiceLineItem {
  isService: boolean;
  price: number;
  description: string;
}

export interface IAppliedInvoice extends IEntity {
  total: number;
  balance: number;
  pdfUrl: string;
  previewUrl: string;
  amount: number;
  prevBalance: number;
  writeOff: boolean;
  dueDate: Date | null;
}

export type InvoiceStatus = 'open' | 'overdue' | 'closed' | 'writeOff';

export type GenerateInvoicesRequest = {
  invoices: (Omit<IInvoiceBuilder, 'payments' | 'preview' | 'customer'> & { customerId: number })[];
};

export enum InvoiceType {
  orders = 'ORDERS',
  subscriptions = 'SUBSCRIPTIONS',
  financeCharges = 'FINANCE_CHARGES',
}

export enum InvoiceStatusEnum {
  open = 'OPEN',
  closed = 'CLOSED',
  overdue = 'OVERDUE',
  writeOff = 'WRITE_OFF',
}

export enum InvoiceAge {
  CURRENT = 'CURRENT',
  OVERDUE_31_DAYS = 'OVERDUE_31_DAYS',
  OVERDUE_61_DAYS = 'OVERDUE_61_DAYS',
  OVERDUE_91_DAYS = 'OVERDUE_91_DAYS',
}

export interface IInvoiceBusinessLine {
  id: string;
  name: string;
  shortName: string;
}

export enum ReservedServiceNames {
  notService = 'not a service',
}
