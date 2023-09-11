import {
  getAddedThirdServiceItemWithLineItemsAndSubOrdersChangesMock,
  getClosedFirstServiceItemWithLineItemsAndSubOrdersChangesMock,
  getUpdatedSecondServiceItemWithLineItemsAndSubOrdersChangesMock,
} from '@tests/__mocks__';

export const getUpdatedSubscriptionWithItemsChangesMock = () => ({
  jobSiteContactId: 54,
  orderContactId: 34,
  unlockOverrides: true,
  bestTimeToCome: 'pm',
  thirdPartyHaulerId: 2,
  driverInstructions: 'test',
  serviceItems: [
    getClosedFirstServiceItemWithLineItemsAndSubOrdersChangesMock(),
    getUpdatedSecondServiceItemWithLineItemsAndSubOrdersChangesMock(),
    getAddedThirdServiceItemWithLineItemsAndSubOrdersChangesMock(),
  ],
});
