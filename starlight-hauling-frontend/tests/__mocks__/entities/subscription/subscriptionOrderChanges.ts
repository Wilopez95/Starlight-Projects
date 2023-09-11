import { UpdateSubscriptionItemType } from '@root/consts';
import {
  getAddedFourthSubscriptionOrderMock,
  getAddedThirdSubscriptionOrderMock,
  getClosedSecondSubscriptionOrderMock,
  getFirstSubscriptionOrderMock,
  getSecondSubscriptionOrderMock,
  getUpdatedFirstSubscriptionOrderMock,
  getUpdatedSecondSubscriptionOrderMock,
} from '@tests/__mocks__';

export const getUpdatedFirstSubscriptionOrderChangesMock = () => ({
  id: 54881,
  eventType: UpdateSubscriptionItemType.edit,
  quantity: 3,
  currentValues: {
    ...getUpdatedFirstSubscriptionOrderMock(),
  },
  previousValues: {
    ...getFirstSubscriptionOrderMock(),
  },
});

export const getUpdatedSecondSubscriptionOrderChangesMock = () => ({
  id: 54882,
  eventType: UpdateSubscriptionItemType.edit,
  serviceDate: new Date('2021-10-22T00:00:00.000Z'),
  price: 120,
  unlockOverrides: true,
  currentValues: {
    ...getUpdatedSecondSubscriptionOrderMock(),
  },
  previousValues: {
    ...getSecondSubscriptionOrderMock(),
  },
});

export const getClosedSecondSubscriptionOrderChangesMock = () => ({
  id: 54882,
  eventType: UpdateSubscriptionItemType.remove,
  price: 120,
  quantity: 0,
  unlockOverrides: true,
  currentValues: {
    ...getClosedSecondSubscriptionOrderMock(),
  },
  previousValues: {
    ...getSecondSubscriptionOrderMock(),
  },
});

export const getAddedThirdSubscriptionOrderChangesMock = () => ({
  id: 0,
  eventType: UpdateSubscriptionItemType.add,
  currentValues: {
    ...getAddedThirdSubscriptionOrderMock(),
  },
  serviceDate: new Date('2021-10-24T00:00:00.000Z'),
  price: 150,
  quantity: 2,
  unlockOverrides: false,
});

export const getAddedFourthSubscriptionOrderChangesMock = () => ({
  id: 0,
  eventType: UpdateSubscriptionItemType.add,
  currentValues: {
    ...getAddedFourthSubscriptionOrderMock(),
  },
  serviceDate: new Date('2021-10-21T00:00:00.000Z'),
  price: 170,
  quantity: 3,
  unlockOverrides: false,
});
