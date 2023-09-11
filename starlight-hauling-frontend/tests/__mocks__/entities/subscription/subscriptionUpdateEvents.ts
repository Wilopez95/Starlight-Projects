import { UpdateSubscriptionItemType } from '@root/consts';
import {
  getAddedFourthLineItemMock,
  getAddedFourthSubscriptionOrderMock,
  getAddedThirdServiceItemMock,
  getAddedThirdServiceItemWithLineItemsAndSubOrdersMock,
  getAddedThirdSubscriptionOrderMock,
  getClosedFirstServiceItemWithLineItemsAndSubOrdersMock,
  getClosedThirdLineItemMock,
} from '@tests/__mocks__';

export const getLineItemsEventsMock = () => [
  {
    subscriptionServiceItemId: 7264,
    subscriptionDraftServiceItemId: 7264,
    effectiveDate: null,
    id: 2642,
    eventType: UpdateSubscriptionItemType.edit,
    billableLineItemId: 12,
    quantity: 3,
    price: 75,
    unlockOverrides: false,
    globalRatesRecurringLineItemsBillingCycleId: 8,
  },
  {
    subscriptionServiceItemId: 7264,
    subscriptionDraftServiceItemId: 7264,
    eventType: UpdateSubscriptionItemType.remove,
    ...getClosedThirdLineItemMock(),
  },
  {
    subscriptionServiceItemId: 7264,
    subscriptionDraftServiceItemId: 7264,
    eventType: UpdateSubscriptionItemType.add,
    ...getAddedFourthLineItemMock(),
  },
];

export const getSubscriptionOrdersEventsMock = () => [
  {
    subscriptionServiceItemId: 7263,
    subscriptionDraftServiceItemId: 7263,
    eventType: UpdateSubscriptionItemType.edit,
    price: 120,
    id: 54882,
    serviceDate: new Date('2021-10-22T00:00:00.000Z'),
    unlockOverrides: true,
    action: 'delivery',
    billableServiceId: 2,
    globalRatesServicesId: 567,
    quantity: 2,
    subscriptionOrderOptions: [
      {
        action: 'delivery',
        label: 'test',
        value: 'test',
      },
    ],
  },
  {
    subscriptionServiceItemId: 7263,
    subscriptionDraftServiceItemId: 7263,
    eventType: UpdateSubscriptionItemType.add,
    ...getAddedThirdSubscriptionOrderMock(),
  },
];

export const getServiceItemsEventsMock = () => [
  {
    eventType: UpdateSubscriptionItemType.edit,
    effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
    id: 7264,
    serviceFrequencyId: 3,
    price: 170,
    unlockOverrides: true,
  },
  {
    eventType: UpdateSubscriptionItemType.add,
    ...getAddedThirdServiceItemMock(),
  },
];

export const getGeneratedEventsMock = () => ({
  serviceItems: [
    {
      eventType: UpdateSubscriptionItemType.remove,
      ...getClosedFirstServiceItemWithLineItemsAndSubOrdersMock(),
    },
    {
      eventType: UpdateSubscriptionItemType.edit,
      effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
      id: 7264,
      serviceFrequencyId: 3,
      price: 170,
      unlockOverrides: true,
    },
    {
      eventType: UpdateSubscriptionItemType.add,
      ...getAddedThirdServiceItemWithLineItemsAndSubOrdersMock(),
    },
  ],
  lineItems: [
    {
      subscriptionServiceItemId: 7264,
      subscriptionDraftServiceItemId: 7264,
      effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
      id: 2642,
      eventType: UpdateSubscriptionItemType.edit,
      billableLineItemId: 12,
      price: 75,
      quantity: 3,
    },
    {
      subscriptionServiceItemId: 7264,
      subscriptionDraftServiceItemId: 7264,
      eventType: UpdateSubscriptionItemType.remove,
      ...getClosedThirdLineItemMock(),
    },
    {
      subscriptionServiceItemId: 7264,
      subscriptionDraftServiceItemId: 7264,
      eventType: UpdateSubscriptionItemType.add,
      ...getAddedFourthLineItemMock(),
    },
  ],
  subscriptionOrders: [
    {
      subscriptionServiceItemId: 7263,
      subscriptionDraftServiceItemId: 7263,
      eventType: UpdateSubscriptionItemType.add,
      ...getAddedThirdSubscriptionOrderMock(),
    },
    {
      subscriptionServiceItemId: 7264,
      subscriptionDraftServiceItemId: 7264,
      eventType: UpdateSubscriptionItemType.edit,
      serviceDate: new Date('2021-10-22T00:00:00.000Z'),
      price: 120,
      unlockOverrides: true,
      id: 54882,
    },
    {
      subscriptionServiceItemId: 7264,
      subscriptionDraftServiceItemId: 7264,
      eventType: UpdateSubscriptionItemType.add,
      ...getAddedFourthSubscriptionOrderMock(),
    },
  ],
});
