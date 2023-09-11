import { UpdateSubscriptionItemType } from '@root/consts';
import {
  getAddedFourthLineItemChangesMock,
  getAddedFourthSubscriptionOrderChangesMock,
  getAddedThirdServiceItemMock,
  getAddedThirdServiceItemWithLineItemsAndSubOrdersMock,
  getAddedThirdSubscriptionOrderChangesMock,
  getClosedFirstServiceItemMock,
  getClosedFirstServiceItemWithLineItemsAndSubOrdersMock,
  getClosedSecondServiceItemMock,
  getClosedSecondServiceItemWithLineItemsAndSubOrdersMock,
  getClosedThirdLineItemChangesMock,
  getFirstServiceItemMock,
  getFirstServiceItemWithLineItemsAndSubOrdersMock,
  getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock,
  getSecondServiceItemMock,
  getSecondServiceItemWithLineItemsAndSubOrdersMock,
  getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock,
  getUpdatedFirstServiceItemMock,
  getUpdatedFirstServiceItemWithLineItemsAndSubOrdersMock,
  getUpdatedSecondLineItemChangesMock,
  getUpdatedSecondServiceItemMock,
  getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderMock,
  getUpdatedSecondServiceItemWithLineItemsAndSubOrdersMock,
  getUpdatedSecondSubscriptionOrderChangesMock,
} from '@tests/__mocks__';

const getUpdatedFirstServiceItemChangesMock = () => ({
  id: 7263,
  materialId: 14,
  quantity: 5,
  price: 145,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedFirstServiceItemMock(),
  },
  previousValues: {
    ...getFirstServiceItemMock(),
  },
});

const getClosedFirstServiceItemChangesMock = () => ({
  id: 7263,
  quantity: 0,
  eventType: UpdateSubscriptionItemType.remove,
  currentValues: {
    ...getClosedFirstServiceItemMock(),
  },
  previousValues: {
    ...getFirstServiceItemMock(),
  },
});

const getUpdatedFirstServiceItemWithLineItemsAndSubOrdersChangesMock = () => ({
  id: 7263,
  materialId: 14,
  quantity: 5,
  price: 145,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedFirstServiceItemWithLineItemsAndSubOrdersMock(),
  },
  previousValues: {
    ...getFirstServiceItemWithLineItemsAndSubOrdersMock(),
  },
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
});

const getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersChangesMock = () => ({
  currentValues: {
    ...getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock(),
  },
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
});

export const getClosedFirstServiceItemWithLineItemsAndSubOrdersChangesMock = () => ({
  id: 7263,
  quantity: 0,
  eventType: UpdateSubscriptionItemType.remove,
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
  currentValues: {
    ...getClosedFirstServiceItemWithLineItemsAndSubOrdersMock(),
  },
  previousValues: {
    ...getFirstServiceItemWithLineItemsAndSubOrdersMock(),
  },
});

const getUpdatedSecondServiceItemChangesMock = () => ({
  id: 7264,
  serviceFrequencyId: 3,
  price: 170,
  unlockOverrides: true,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedSecondServiceItemMock(),
  },
  previousValues: {
    ...getSecondServiceItemMock(),
  },
});

const getClosedSecondServiceItemChangesMock = () => ({
  id: 7264,
  quantity: 0,
  eventType: UpdateSubscriptionItemType.remove,
  currentValues: {
    ...getClosedSecondServiceItemMock(),
  },
  previousValues: {
    ...getSecondServiceItemMock(),
  },
});

const getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderChangesMock = () => ({
  id: 7264,
  serviceFrequencyId: 3,
  price: 170,
  unlockOverrides: true,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderMock(),
  },
  previousValues: {
    ...getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  },
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
});

export const getUpdatedSecondServiceItemWithLineItemsAndSubOrdersChangesMock = () => ({
  id: 7264,
  serviceFrequencyId: 3,
  price: 170,
  unlockOverrides: true,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedSecondServiceItemWithLineItemsAndSubOrdersMock(),
  },
  previousValues: {
    ...getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  },
  lineItems: [
    getUpdatedSecondLineItemChangesMock(),
    getClosedThirdLineItemChangesMock(),
    getAddedFourthLineItemChangesMock(),
  ],
  subscriptionOrders: [
    getUpdatedSecondSubscriptionOrderChangesMock(),
    getAddedFourthSubscriptionOrderChangesMock(),
  ],
});

const getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersChangesMock = () => ({
  currentValues: {
    ...getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock(),
  },
  lineItems: [getAddedFourthLineItemChangesMock()],
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
});

const getClosedSecondServiceItemWithLineItemsAndSubOrdersChangesMock = () => ({
  id: 7264,
  quantity: 0,
  eventType: UpdateSubscriptionItemType.remove,
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
  currentValues: {
    ...getClosedSecondServiceItemWithLineItemsAndSubOrdersMock(),
  },
  previousValues: {
    ...getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  },
});

const getAddedThirdServiceItemChangesMock = () => ({
  id: 0,
  billableServiceId: 1840,
  serviceFrequencyId: 3,
  price: 140,
  unlockOverrides: false,
  quantity: 3,
  materialId: 15,
  serviceDaysOfWeek: [],
  eventType: UpdateSubscriptionItemType.add,
  currentValues: {
    ...getAddedThirdServiceItemMock(),
  },
});

export const getAddedThirdServiceItemWithLineItemsAndSubOrdersChangesMock = () => ({
  id: 0,
  billableServiceId: 1840,
  serviceFrequencyId: 3,
  price: 140,
  unlockOverrides: false,
  quantity: 3,
  materialId: 15,
  serviceDaysOfWeek: [],
  eventType: UpdateSubscriptionItemType.add,
  currentValues: {
    ...getAddedThirdServiceItemWithLineItemsAndSubOrdersMock(),
  },
  lineItems: [getAddedFourthLineItemChangesMock()],
  subscriptionOrders: [getAddedThirdSubscriptionOrderChangesMock()],
});

export const getServiceItemsChangesMock = () => [
  getUpdatedFirstServiceItemChangesMock(),
  getUpdatedSecondServiceItemChangesMock(),
];

export const getServiceItemsWithNewServiceItemChangesMock = () => [
  getUpdatedFirstServiceItemChangesMock(),
  getUpdatedSecondServiceItemChangesMock(),
  getAddedThirdServiceItemChangesMock(),
];

export const getClosedServiceItemsWithNewChangesMock = () => [
  getClosedFirstServiceItemChangesMock(),
  getClosedSecondServiceItemChangesMock(),
  getAddedThirdServiceItemChangesMock(),
];

export const getServiceItemsWithLineItemsAndSubOrdersChangesMock = () => [
  getUpdatedFirstServiceItemWithLineItemsAndSubOrdersChangesMock(),
  getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderChangesMock(),
];

export const getServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock = () => [
  getUpdatedFirstServiceItemWithLineItemsAndSubOrdersChangesMock(),
  getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderChangesMock(),
  getAddedThirdServiceItemWithLineItemsAndSubOrdersChangesMock(),
];

export const getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersChangesMock = () => [
  getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersChangesMock(),
  getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersChangesMock(),
];

export const getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersChangesMock = () => [
  getClosedFirstServiceItemWithLineItemsAndSubOrdersChangesMock(),
  getClosedSecondServiceItemWithLineItemsAndSubOrdersChangesMock(),
  getAddedThirdServiceItemWithLineItemsAndSubOrdersChangesMock(),
];
