import { ISubscriptionOrderLineItem } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getDefaultLineItem = (billableLineItemId: number): ISubscriptionOrderLineItem => ({
  id: 0,
  billableLineItemId,
  quantity: 1,
  units: undefined,
  customRatesGroupLineItemsId: undefined,
  globalRatesLineItemsId: undefined,
  price: undefined,
  materialId: null,
  unlockOverrides: false,
  historicalLineItem: {
    description: '',
    oneTime: true,
    unit: undefined,
    originalId: billableLineItemId,
  },
});
