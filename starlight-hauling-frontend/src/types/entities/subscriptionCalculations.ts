import { BillingCycleEnum, ProrationTypeEnum } from '@root/consts';

import { ISubscriptionOrder } from './subscriptionOrder/subscriptionOrder';
import { IServiceDaysOfWeek } from './serviceItem';
import { ITaxesInfo } from './taxesInfo';

export interface IProrationData {
  totalPrice: number | null;
  totalDay: number | null;
  usageDay: number | null;
  proratedTotal: number | null;
  effectiveDate: Date;
  price: number | null;
  quantity: number;
  periodFrom: Date;
  periodTo: Date;
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;
}

export interface ILineItemProrationInfo extends IProrationData {
  lineItemId: number;
  billableLineItemId: number;
}

export interface IServiceItemProrationInfo extends IProrationData {
  isApplicable: boolean;
  billableServiceId: number;
}

export type ISubscriptionOrderSummary = Pick<
  ISubscriptionOrder,
  'id' | 'price' | 'quantity' | 'serviceDate' | 'billableServiceId'
>;

export interface IProrationInfo {
  lineItemsProrationInfo: ILineItemProrationInfo[];
  serviceItemProrationInfo: IServiceItemProrationInfo | null;
  subscriptionOrders: ISubscriptionOrderSummary[];
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;
  serviceItemId: number;
  billableServiceId: number;
}

export interface IServiceItemProration {
  periodFrom: Date;
  periodTo: Date;
  nextBillingPeriodTo: Date;
  nextBillingPeriodFrom: Date;
  serviceItemId: number;
  billableServiceId: number;
  serviceItemProrationInfo?: IServiceItemProrationInfo;
  subscriptionOrders?: ISubscriptionOrderSummary[];
  lineItemsProrationInfo?: ILineItemProrationInfo[];
}

export interface ISubscriptionProration {
  taxesInfo: ITaxesInfo;
  billableServiceId: number;
  summaryForFirstBillingPeriod: number;
  summaryForSecondBillingPeriod: number;
  // example of prorationInfo: [currentBillingPeriod, nextBillingPeriod, ...toInfinityAndBeyond]
  prorationInfo: IProrationInfo[][];
  prorationPeriods: IServiceItemProration[][][];
  showProrationButton: boolean;
  serviceTotal: number;
  lineItemsTotal: number;
  subscriptionOrdersTotal: number;
  grandTotal: number;
  recurringGrandTotal: number;
}

interface IReviewProrationItem {
  id: number;
  prorationEffectivePrice: number | null;
  prorationEffectiveDate: Date | null;
  prorationOverride?: boolean;
}

export interface IReviewProrationLineItem extends IReviewProrationItem {
  billableLineItemId: number;
}

export interface IReviewProrationService extends IReviewProrationItem {
  billableServiceId: number;
  lineItems?: IReviewProrationLineItem[];
}

export interface IReviewProration {
  serviceItems: IReviewProrationService[];
}

export interface ICalculateSubscriptionPricesConfig {
  customerId: number;
  customerJobSiteId: number | null;
  jobSiteId: number;
  businessUnitId: number;
  businessLineId: number;
  billingCycle: BillingCycleEnum;
  anniversaryBilling: boolean;
  customRatesGroupId: number | null;
  startDate: Date;
  endDate: Date | null;
  billingCycleCount: number;
  serviceItems: {
    serviceItemId: number | null;
    billableServiceId: number | null;
    materialId: number | null;
    serviceFrequencyId: number | null;
    serviceDaysOfWeek: IServiceDaysOfWeek | null;
    price: number | null;
    quantity: number;
    prorationType: ProrationTypeEnum | null;
    effectiveDate: Date | null;
    lineItems?: {
      lineItemId: number | null;
      billableLineItemId: number | null;
      price: number | null;
      quantity: number;
    }[];
    subscriptionOrders?: {
      subscriptionOrderId: number | null;
      billableServiceId: number | null;
      serviceDate: Date | null;
      price: number | null;
      quantity: number;
    }[];
  }[];
}

export interface ISubscriptionPrices {
  serviceItems: {
    billableServiceId: number | null;
    globalRatesRecurringServicesId: number | null;
    customRatesGroupServicesId: number | null;
    price: number;
    lineItems: {
      billableLineItemId: number | null;
      globalRatesRecurringLineItemsBillingCycleId: number | null;
      customRatesGroupRecurringLineItemBillingCycleId: number | null;
      price: number;
    }[];
    subscriptionOrders: {
      billableServiceId: number | null;
      globalRatesServicesId: number | null;
      customRatesGroupServicesId: number | null;
      price: number;
    }[];
  }[];
}

export interface ISubscriptionCalculations {
  subscriptionPrices: ISubscriptionPrices;
  subscriptionPriceCalculation: ISubscriptionProration;
}
