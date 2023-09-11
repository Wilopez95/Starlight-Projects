import { Point } from 'geojson';

import { BillingCycleEnum } from '@root/consts';
import {
  ICustomerWithCommonInvoiceDrafts,
  ICustomerWithInvoiceDrafts,
  IEntity,
  IGlobalRateLineItem,
  IGlobalRateService,
  IGlobalRateSurcharge,
  IOrdersInvoiceDraft,
  IPriceGroupRateLineItem,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  ISubscriptionsInvoiceDraft,
  JsonConversions,
} from '@root/types';

export interface IOrderSelectRatesRequest {
  customerId: number;
  customerJobSiteId: number | null;
  serviceDate: Date | string;
  businessUnitId: number;
  businessLineId: number;
  serviceAreaId?: number;
  customRateGroupId?: number;
}

export interface IOrderCustomRatesGroup {
  id: number;
  description: string;
  customerGroupId?: number | null;
  customerId?: number | null;
  customerJobSiteId?: number | null;
  jobSiteId?: number | null; // subs related old code?
  serviceAreaId?: number | null;
}
export interface IOrderSelectGlobalRatesResponse {
  level: 'global';
}

export interface IOrderSelectCustomRatesResponse {
  level: 'custom';
  customRatesGroups: IOrderCustomRatesGroup[];
  selectedId: number;
}

export type IOrderSelectRatesResponse =
  | IOrderSelectGlobalRatesResponse
  | IOrderSelectCustomRatesResponse;

export interface IOrderRatesCalculateRequest {
  businessUnitId: number;
  businessLineId: number;
  type: 'global' | 'custom';
  customRatesGroupId?: number;
  billableService?: {
    billableServiceId?: number;
    equipmentItemId?: number;
    materialId?: number | null;
  };
  billableLineItems?: {
    lineItemId: number;
    materialId?: number | null;
  }[];
  billableServiceIds?: number[];
  recurringLineItemIds?: number[];
  billingCycle?: BillingCycleEnum;
}

export interface IOrderInvoicingRequest extends IInvoicingRequest {
  endingDate: Date;
}

export interface ICommonInvoicingRequest extends IInvoicingRequest {
  billingDate: Date; // same with `endingDate` of `IOrderInvoicingRequest`

  businessLineIds: number[];
  arrears?: boolean;
  inAdvance?: boolean;
  subscriptionsCount?: number;
  ordersCount?: number;
}

export interface IInvoicingRequest {
  customerId?: number;
  customerGroupId?: number;
  billingCycles?: BillingCycleEnum[];
  prepaid?: boolean;
  onAccount?: boolean;
}

export interface IPriceGroupRateServiceResponse extends IPriceGroupRateService {
  customRatesGroupId: number;
  price: number;
}

export interface IPriceGroupRateLineItemResponse
  extends IPriceGroupRateLineItem,
    Omit<IEntity, 'updatedAt' | 'id'> {
  customRatesGroupId: number;
  price: number;
  materialId?: number;
}

export interface IPriceGroupRateSurchargeResponse
  extends IPriceGroupRateSurcharge,
    Omit<IEntity, 'updatedAt' | 'id'> {
  customRatesGroupId: number;
  price: number;
}

export interface IOrderRatesCalculateResponse {
  globalRates?: {
    globalRatesService?: IGlobalRateService;
    globalRatesLineItems?: IGlobalRateLineItem[];
    globalRecurringLineItems?: IGlobalRateLineItem[];
    globalRatesServiceItems?: IGlobalRateService[];
    globalRatesSurcharges?: IGlobalRateSurcharge[];
  };
  customRates?: {
    customRatesService?: IPriceGroupRateServiceResponse;
    customRatesLineItems?: IPriceGroupRateLineItemResponse[];
    customRecurringLineItems?: IPriceGroupRateLineItemResponse[];
    customRatesServiceItems?: IPriceGroupRateServiceResponse[];
    customRatesSurcharges?: IPriceGroupRateSurchargeResponse[];
  };
}

interface IInvoicingResponse<T> {
  processedOrders: number;
  processedSubscriptions: number;
  generatedInvoices: number;
  customersCount: number;
  invoicesTotal: number;
  onAccount: T;
  prepaid: T;
}

export type RunInvoicingResponse = IInvoicingResponse<ICustomerWithInvoiceDrafts[]>;

export enum InvoicingType {
  Orders = 'orders',
  Subscriptions = 'subscriptions',
}

export interface IInvoicesUnion<T, U> {
  [InvoicingType.Orders]: T[];
  [InvoicingType.Subscriptions]: U[];
}

export type CustomersWithCommonInvoiceResponse = IInvoicesUnion<
  JsonConversions<ICustomerWithCommonInvoiceDrafts<IOrdersInvoiceDraft[]>>,
  JsonConversions<ICustomerWithCommonInvoiceDrafts<ISubscriptionsInvoiceDraft[]>>
>;
export type RunCommonInvoicingResponse = IInvoicingResponse<CustomersWithCommonInvoiceResponse>;

export type CustomerWithCommonInvoiceDrafts = ICustomerWithCommonInvoiceDrafts<
  Partial<IInvoicesUnion<IOrdersInvoiceDraft, ISubscriptionsInvoiceDraft>>
>;
export type RunCommonInvoicingResponseNormalized = IInvoicingResponse<
  CustomerWithCommonInvoiceDrafts[]
>;

export type InvoicingData = RunCommonInvoicingResponseNormalized;

export interface ISaveInvoicesResponse {
  generationJobId: string;
}

export interface IDroppedEquipmentItem {
  id: string;
  point: Point;
  orderId?: string;
}
