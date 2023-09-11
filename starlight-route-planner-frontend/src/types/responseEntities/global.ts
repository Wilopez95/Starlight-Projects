import { BBox } from 'geojson';

import { TaxDistrictType } from '../enums';

export interface IMultiSearchResponse {
  customers: CustomerSuggestion[];
}
export interface IAdvancedMultiSearchResponse {
  customers: CustomerSuggestion[];
  orders: OrderSuggestion[];
  workOrders: WorkOrderSuggestion[];
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

export interface IAdministrativeSearchResponse {
  id: string;
  name: string;
  level: TaxDistrictType;
  bbox?: BBox;
  state?: string;
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

export type HighlightableEntity<T, K extends keyof T> = T & {
  highlight?: {
    [Key in K]?: string[];
  };
};
