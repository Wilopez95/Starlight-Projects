export interface ISubscriptionLineItem {
  billableLineItemId: number;
  quantity: number;
  unlockOverrides: boolean;
  price: number;
  id?: number;
  billableLineItem?: string;
  subscriptionServiceItemId?: number;
  globalRatesRecurringLineItemsBillingCycleId?: number;
  customRatesGroupRecurringLineItemBillingCycleId?: number;
  effectiveDate?: Date | null;
  isDeleted?: boolean;
  changeReason?: string;
}
