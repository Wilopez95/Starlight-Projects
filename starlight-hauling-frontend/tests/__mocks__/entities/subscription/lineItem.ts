import { INewSubscriptionLineItem } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getFirstLineItemMock = (): INewSubscriptionLineItem => ({
  billableLineItemId: 9,
  effectiveDate: null,
  globalRatesRecurringLineItemsBillingCycleId: 5,
  id: 2641,
  price: 45,
  quantity: 1,
  unlockOverrides: false,
});

export const getSecondLineItemMock = (): INewSubscriptionLineItem => ({
  billableLineItemId: 10,
  effectiveDate: null,
  globalRatesRecurringLineItemsBillingCycleId: 8,
  id: 2642,
  price: 55,
  quantity: 2,
  unlockOverrides: false,
});

export const getSecondLineItemWithMinorChangesMock = (): INewSubscriptionLineItem => ({
  ...getSecondLineItemMock(),
  globalRatesRecurringLineItemsBillingCycleId: 10,
});

export const getUpdatedSecondLineItemMock = (): INewSubscriptionLineItem => ({
  ...getSecondLineItemMock(),
  billableLineItemId: 12,
  price: 75,
  quantity: 3,
});

export const getThirdLineItemMock = (): INewSubscriptionLineItem => ({
  billableLineItemId: 20,
  effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
  globalRatesRecurringLineItemsBillingCycleId: 9,
  id: 2643,
  price: 80,
  quantity: 4,
  unlockOverrides: false,
});

export const getClosedThirdLineItemMock = (): INewSubscriptionLineItem => ({
  ...getThirdLineItemMock(),
  quantity: 0,
});

export const getAddedFourthLineItemMock = (): INewSubscriptionLineItem => ({
  billableLineItemId: 15,
  effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
  globalRatesRecurringLineItemsBillingCycleId: 12,
  id: 0,
  price: 85,
  quantity: 5,
  unlockOverrides: true,
});

export const getOriginalLineItemsMock = (): INewSubscriptionLineItem[] => [
  getFirstLineItemMock(),
  getSecondLineItemMock(),
  getThirdLineItemMock(),
];

export const getLineItemsWithMinorChangesMock = (): INewSubscriptionLineItem[] => [
  getFirstLineItemMock(),
  getSecondLineItemWithMinorChangesMock(),
  getThirdLineItemMock(),
];
