import { type IInvoiceBuilder } from '@starlightpro/invoice-builder';
import { IOrder } from '@starlightpro/invoice-builder/build/types';

import { GraphqlVariables } from '../../../api/base';
import { AppliedFilterState } from '../../../common/TableTools/TableFilter';
import { BillingCycleEnum } from '../../../consts';
import { type IEntity, type IInvoicingSubscriptions, type Maybe } from '../../../types';
import { type IBillingCustomer } from '../../../types/queries';
import { type ManuallyCreatablePayment } from '../Payments/types';

export interface IInvoice extends IEntity {
  type: InvoiceType;
  checked: boolean;
  csrName: string;
  csrEmail: string;
  total: number;
  balance: number;
  customer: Maybe<IBillingCustomer>;
  pdfUrl: Maybe<string>;
  writeOff: boolean;
  dueDate: Date | null;
  invoicedEntity?: IInvoiceOrder[];
  invoicedSubscriptionEntity?: IInvoiceSubscriptionResponse[];
  orders?: IInvoiceOrder[];
  payments?: ManuallyCreatablePayment[];
  emails?: IInvoiceEmail[];
  fine?: number;
  statementDate?: string;
  endStatementDate?: string;
  statementId?: number;
  businessLines: IInvoiceBusinessLine[];
  financeChargeId?: number;
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
  sequenceId: string;
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
  sequenceId: string;
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
  amount: number;
  prevBalance: number;
  writeOff: boolean;
  dueDate: Date | null;
  financeChargeId?: number;
}

export type InvoiceStatus = 'open' | 'overdue' | 'closed' | 'writeOff';

export type GenerateInvoicesRequest = {
  invoices: (Omit<IInvoiceBuilder, 'payments' | 'preview' | 'customer' | 'orders'> & {
    customerId: number;
    subscriptions?: IInvoicingSubscriptions[];
    orders?: IOrder[];
  })[];
  billingDate?: Date;
  businessUnitId?: number;
};

export type GenerateSubscriptionInvoicesRequest = {
  invoices: ISubscriptionInvoiceDraftRequest[];
};

export interface ISubscriptionInvoiceDraftRequest {
  subscriptions: IInvoicingSubscriptions[];
  customerId: number;
  attachMediaPref: boolean;
}

export enum InvoiceType {
  orders = 'ORDERS',
  financeCharges = 'FINANCE_CHARGES',
  subscriptions = 'SUBSCRIPTIONS',
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

export type InvoicesByBuRequestBody = GraphqlVariables & {
  businessUnitId: number;
  customerId?: number;
  subscriptionId?: number;
  filters?: AppliedFilterState;
};
