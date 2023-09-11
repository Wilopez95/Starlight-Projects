import { BillableItemActionEnum } from '@root/consts';
import { INewSubscriptionOrder } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

export const getNewSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  id: 0,
  billableServiceId: 1,
  quantity: 1,
  unlockOverrides: false,
  price: 1,
  subscriptionOrderOptions: [],
  globalRatesServicesId: 1,
  customRatesGroupServicesId: 1,
  serviceDate: new Date('December 1, 2021 00:00:00'),
  action: BillableItemActionEnum.delivery,
  isFinalForService: false,
});

export const getFirstSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  id: 54881,
  billableServiceId: 1,
  globalRatesServicesId: 564,
  subscriptionOrderOptions: [],
  serviceDate: new Date('2021-10-16T00:00:00.000Z'),
  price: 87,
  quantity: 1,
  action: 'delivery',
  unlockOverrides: false,
});

export const getFirstSubscriptionOrderWithMinorChangesMock = (): INewSubscriptionOrder => ({
  ...getFirstSubscriptionOrderMock(),
  billableServiceId: 2,
  globalRatesServicesId: 45,
});

export const getUpdatedFirstSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  ...getFirstSubscriptionOrderMock(),
  billableServiceId: 3,
  globalRatesServicesId: 569,
  quantity: 3,
});

export const getSecondSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  id: 54882,
  billableServiceId: 2,
  globalRatesServicesId: 567,
  subscriptionOrderOptions: [],
  serviceDate: new Date('2021-10-18T00:00:00.000Z'),
  price: 100,
  quantity: 2,
  action: 'delivery',
  unlockOverrides: false,
});

export const getUpdatedSecondSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  ...getSecondSubscriptionOrderMock(),
  subscriptionOrderOptions: [
    {
      value: 'test',
      label: 'test',
      action: BillableItemActionEnum.delivery,
    },
  ],
  serviceDate: new Date('2021-10-22T00:00:00.000Z'),
  price: 120,
  unlockOverrides: true,
});

export const getClosedSecondSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  ...getSecondSubscriptionOrderMock(),
  subscriptionOrderOptions: [],
  price: 120,
  quantity: 0,
  unlockOverrides: true,
});

export const getAddedThirdSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  id: 0,
  billableServiceId: 5,
  globalRatesServicesId: 367,
  subscriptionOrderOptions: [],
  serviceDate: new Date('2021-10-24T00:00:00.000Z'),
  price: 150,
  quantity: 2,
  action: 'delivery',
  unlockOverrides: false,
});

export const getAddedFourthSubscriptionOrderMock = (): INewSubscriptionOrder => ({
  id: 0,
  billableServiceId: 7,
  globalRatesServicesId: 245,
  subscriptionOrderOptions: [],
  serviceDate: new Date('2021-10-21T00:00:00.000Z'),
  price: 170,
  quantity: 3,
  action: 'delivery',
  unlockOverrides: false,
});

export const getOriginalSubscriptionOrdersMock = (): INewSubscriptionOrder[] => [
  getFirstSubscriptionOrderMock(),
  getSecondSubscriptionOrderMock(),
];

export const getSubscriptionOrdersWithNewMock = (): INewSubscriptionOrder[] => [
  getFirstSubscriptionOrderMock(),
  getSecondSubscriptionOrderMock(),
  getAddedThirdSubscriptionOrderMock(),
];
