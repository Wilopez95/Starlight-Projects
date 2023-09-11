import { UpdateSubscriptionItemType } from '@root/consts';
import {
  getAddedFourthLineItemMock,
  getClosedThirdLineItemMock,
  getSecondLineItemMock,
  getThirdLineItemMock,
  getUpdatedSecondLineItemMock,
} from '@tests/__mocks__';

export const getUpdatedSecondLineItemChangesMock = () => ({
  billableLineItemId: 12,
  id: 2642,
  eventType: UpdateSubscriptionItemType.edit,
  currentValues: {
    ...getUpdatedSecondLineItemMock(),
  },
  previousValues: {
    ...getSecondLineItemMock(),
  },
  price: 75,
  quantity: 3,
});

export const getClosedThirdLineItemChangesMock = () => ({
  id: 2643,
  quantity: 0,
  eventType: UpdateSubscriptionItemType.remove,
  currentValues: {
    ...getClosedThirdLineItemMock(),
  },
  previousValues: {
    ...getThirdLineItemMock(),
  },
});

export const getAddedFourthLineItemChangesMock = () => ({
  billableLineItemId: 15,
  id: 0,
  price: 85,
  quantity: 5,
  unlockOverrides: true,
  eventType: UpdateSubscriptionItemType.add,
  currentValues: {
    ...getAddedFourthLineItemMock(),
  },
});
