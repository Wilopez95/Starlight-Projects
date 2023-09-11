import type { BBox, Point } from 'geojson';

import type { TaxDistrictType } from '../enums';

export interface IMultiSearchResponse {
  customers: CustomerSuggestion[];
}
export interface IAdvancedMultiSearchResponse {
  customers: CustomerSuggestion[];
  orders: OrderSuggestion[];
  workOrders: WorkOrderSuggestion[];
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
  email?: string;
  name: string;
  mailingAddress: string;
  billingAddress: string;
  phoneNumbers: string[];
  contactName: string;
  contactEmail: string;
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

export interface IAdministrativeSearchResponse {
  id: string;
  name: string;
  level: TaxDistrictType;
  bbox?: BBox;
  state?: string;
}

export type CustomerSuggestionFields = keyof ICustomerSuggestion;

export type OrderSuggestion = HighlightableEntity<IOrderSuggestion, 'id'>;
export type WorkOrderSuggestion = HighlightableEntity<IWorkOrderSuggestion, 'woNumber'>;
export type CustomerSuggestion = HighlightableEntity<ICustomerSuggestion, CustomerSuggestionFields>;
export type AddressSuggestion = HighlightableEntity<IAddressSuggestion, 'address'>;

export type HighlightableEntity<T, K extends keyof T> = T & {
  highlight?: {
    [Key in K]?: string[];
  };
};
