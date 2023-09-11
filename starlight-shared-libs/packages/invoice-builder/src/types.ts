export interface IAddress {
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  zip: string;
}

export type PaymentTerms = 'cod' | 'net15Days' | 'net30Days' | 'net60Days';
export type InvoiceConstruction = 'byOrder' | 'byAddress' | 'byCustomer';

export interface ICustomer {
  id: number;
  billingAddress: IAddress;
  invoiceConstruction: InvoiceConstruction;
  paymentTerms?: PaymentTerms;
  name?: string;
}

export interface IService {
  description: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  id: number;
  serviceDate: Date;
  beforeTaxesTotal: number;
  grandTotal: number;
  surchargesTotal: number;
  services: IService[];
  jobSite: IAddress;
  poNumber?: string;
  woNumber?: number;
  ticket?: string;
}

export enum BillingCycleEnum {
  daily = 'daily',
  weekly = 'weekly',
  _28days = '28days',
  monthly = 'monthly',
  quarterly = 'quarterly',
  yearly = 'yearly',
}

export enum BillingTypeEnum {
  arrears = 'arrears',
  inAdvance = 'inAdvance',
}

export interface IServiceItemApplicable {
  description: string;
  effectiveDate: string | null;
  from: string;
  isApplicable: boolean;
  nextBillingPeriodFrom: string;
  nextBillingPeriodTo: string;
  price: number;
  proratedTotal: number;
  prorationEffectiveDate: null;
  prorationEffectivePrice: null;
  quantity: number;
  since: string;
  subscriptionOrdersSort: ISubscriptionOrders[];
  subscriptionOrdersTotal: number;
  totalDay: number;
  totalPrice: number;
  usageDay: number;
}

export interface ISubscriptionOrders {
  subscriptionOrderId: number;
  price: number;
  status: string;
  quantity: number;
  grandTotal: number;
  jobSiteId: number;
  serviceDate: string;
  serviceName: string;
  id: number;
}

export interface ILineItemsProrationInfo {
  totalPrice: number;
  totalDay: number;
  usageDay: number;
  price: number;
  quantity: number;
  proratedTotal: number;
  nextBillingPeriodTo: string;
  nextBillingPeriodFrom: string;
  description: string;
  effectiveDate: string | null;
  from: string | null;
  id: number;
  lineItemId: number;
  prorationEffectiveDate: string | null;
  prorationEffectivePrice: string | null;
  serviceDaysOfWeek: unknown;
  since: string;
  subscriptionServiceItemId: number;
}

export enum SubscriptionStatusEnum {
  Active = 'active',
  OnHold = 'onHold',
  Closed = 'closed',
}

export interface IInvoicingSubscriptions {
  id: number;
  anniversaryBilling: boolean;
  businessLineId: number;
  businessUnitId: number;
  billingCycle: BillingCycleEnum;
  billingType: BillingTypeEnum;
  nextBillingPeriodFrom: number | Date;
  nextBillingPeriodTo: number | Date;
  startDate: Date | null;
  endDate: Date | null;
  summaryPerServiceItem: {
    price: number;
    serviceItemId: string;
    serviceName: string;
    serviceItemsApplicable: IServiceItemApplicable[];
    lineItemsProrationInfo: ILineItemsProrationInfo[];
  }[];
  serviceItems: {
    price: number;
    quantity: number;
    serviceItemId: string;
    serviceName: string;
    serviceItemsApplicable: IServiceItemApplicable[];
    lineItemsProrationInfo: ILineItemsProrationInfo[];
    billableService: { description: string };
    lineItems: { price: number; quantity: number }[];
    subscriptionOrders: { sequenceId: string }[];
  }[];
  jobSiteAddress: IAddress;
  totalPriceForSubscription: number;
  status: SubscriptionStatusEnum;
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
