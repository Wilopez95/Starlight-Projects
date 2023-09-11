import { ISurchargesOrderData } from '@root/components/modals/SurchargesView/types';

import { ITaxesInfo } from '../../taxesInfo';

// prices
export interface ISubscriptionOrderLineItemPrices {
  price: number;
  globalRatesLineItemsId: number | null;
  customRatesGroupLineItemsId: number | null;
}

export interface ISubscriptionOrderPrices {
  price: number;
  customRatesGroupServicesId: number;
  globalRatesServicesId: number | null;
  lineItems: ISubscriptionOrderLineItemPrices[];
}

// summary
export interface ICalculateSubscriptionOrderSummary {
  grandTotal: number;
  subscriptionOrdersTotal: number;
  surchargesTotal: number;
  lineItemsTotal: number;
  total: number;
  taxesInfo: ITaxesInfo;
  orderSurcharges: ISurchargesOrderData[];
}

// response
export interface ISubscriptionOrderCalculatePriceResponse {
  prices: ISubscriptionOrderPrices;
  summary: ICalculateSubscriptionOrderSummary;
}
