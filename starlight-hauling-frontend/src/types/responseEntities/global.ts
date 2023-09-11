import { type BBox, type Point } from 'geojson';

import { CustomerStatus } from '@root/consts';
import { IInvoice } from '@root/modules/billing/types';

import { ICustomer } from '..';
import {
  type IQbIntegrationLog,
  type IAuditLogEntry,
  type IQbAccounts,
  type IQbBillableItems,
} from '../entities';
import { type TaxDistrictType } from '../enums';

export interface IMultiSearchResponse {
  jobSites: AddressSuggestion[];
  customers: CustomerSuggestion[];
}
export interface IAdvancedMultiSearchResponse {
  jobSites: AddressSuggestion[];
  customers: CustomerSuggestion[];
  orders: OrderSuggestion[];
  workOrders: WorkOrderSuggestion[];
}

export interface IAuditLogResponse {
  total: number;
  length: number;
  items: IAuditLogEntry[];
}

export interface IQbIntegrationLogResponse {
  total: number;
  length: number;
  items: IQbIntegrationLog[];
}

export interface IQbAccountsResponse {
  total: number;
  length: number;
  items: IQbAccounts[];
}

export interface IQbBillableItemsResponse {
  total: number;
  length: number;
  items: IQbBillableItems[];
}

interface IOrderSuggestion {
  id: number;
  customerName: string;
}

interface IWorkOrderSuggestion {
  id: number;
  orderId: number;
  customerName: string;
  woNumber: number;
}

interface ICustomerSuggestion {
  id: number;
  name: string;
  mailingAddress: string;
  billingAddress: string;
  phoneNumbers: string[];
  contactName: string;
  contactEmail: string;
  status: CustomerStatus;
  email?: string;
}

interface IAddressSuggestion {
  id: number;
  location: Point;
  address: string;
  zip: string;
  city: string;
  state: string;
  country: string;
  fullAddress?: string;
}

interface IFacilitySuggestion {
  id: number;
  address: string;
  addressLine1: string;
  addressLine2: string | null;
  zip: string;
  city: string;
  state: string;
  sameTenant: boolean;
  tenantName: string;
}

export interface IAdministrativeSearchResponse {
  id: string;
  name: string;
  level: TaxDistrictType;
  bbox?: BBox;
  primaryUnit?: string;
}

interface IInvoiceSuggestion {
  id: number;
  customer?: ICustomer;
}

export type CustomerSuggestionFields =
  | 'id'
  | 'name'
  | 'email'
  | 'mailingAddress'
  | 'billingAddress'
  | 'phoneNumbers'
  | 'contactName'
  | 'contactEmail';

export type OrderSuggestion = HighlightableEntity<IOrderSuggestion, 'id'>;
export type WorkOrderSuggestion = HighlightableEntity<IWorkOrderSuggestion, 'woNumber'>;
export type CustomerSuggestion = HighlightableEntity<ICustomerSuggestion, CustomerSuggestionFields>;
export type AddressSuggestion = HighlightableEntity<IAddressSuggestion, 'address'>;
export type FacilitySuggestion = HighlightableEntity<IFacilitySuggestion, 'address'>;
export type InvoiceSuggestion = HighlightableEntity<IInvoiceSuggestion, 'id'>;

export type HighlightableEntity<T, K extends keyof T> = T & {
  highlight?: {
    [Key in K]?: string[];
  };
};

export interface IResponseCustomersOrInvoices {
  customers: ICustomer[];
  invoices: IInvoice[];
}
