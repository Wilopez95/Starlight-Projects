export interface ISubscriptionOrderLineItemCalculatePayload {
  lineItemId: number | null;
  billableLineItemId: number;
  materialId: number | null;
  price: number | null;
  quantity: number;
  unlockOverrides: boolean;
}
export interface ISubscriptionOrderCalculatePayload {
  subscriptionOrderId: number | null;
  billableServiceId: number | null;
  price: number | null;
  quantity: number;
  unlockOverrides: boolean;
  applySurcharges: boolean;
  lineItems: ISubscriptionOrderLineItemCalculatePayload[];
  materialId?: number;
}
export interface ISubscriptionOrderCalculatePricePayload {
  businessUnitId: number;
  businessLineId: number;
  customRatesGroupId: number | null;
  serviceDate: Date;
  jobSiteId: number | null;
  subscriptionOrder: ISubscriptionOrderCalculatePayload;
  customerId?: number;
}
