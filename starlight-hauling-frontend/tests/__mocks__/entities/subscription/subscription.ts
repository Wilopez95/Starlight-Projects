import { ClientRequestType } from '@root/consts';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

import {
  getAddedThirdServiceItemMock,
  getAddedThirdServiceItemWithLineItemsAndSubOrdersMock,
  getClosedFirstServiceItemWithLineItemsAndSubOrdersMock,
  getFirstServiceItemMock,
  getFirstServiceItemWithLineItemsAndSubOrdersMock,
  getFirstServiceItemWithLineItemsAndUpdatedSubOrdersMock,
  getSecondServiceItemWithLineItemsAndSubOrdersMock,
  getSecondServiceItemWithUpdatedLineItemsAndSubOrdersMock,
  getUpdatedSecondServiceItemMock,
  getUpdatedSecondServiceItemWithLineItemsAndSubOrdersMock,
} from './serviceItem';

export const getInitialSubscriptionMock = (): INewSubscription => ({
  type: ClientRequestType.Subscription,
  searchString: '',
  customerId: 3383,
  jobSiteId: 382,
  jobSiteContactId: 242,
  overrideCreditLimit: false,
  id: 2906,
  businessUnitId: '2',
  businessLineId: '4',
  poRequired: true,
  permitRequired: false,
  signatureRequired: false,
  popupNote: 'Pop-up note',
  alleyPlacement: false,
  grandTotal: 187,
  unlockOverrides: false,
  recurringGrandTotal: 0,
  highPriority: false,
  someoneOnSite: false,
  orderContactId: 342,
  bestTimeToCome: 'am',
  bestTimeToComeFrom: '',
  bestTimeToComeTo: '',
  serviceItems: [
    getFirstServiceItemWithLineItemsAndSubOrdersMock(),
    getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  ],
  minBillingPeriods: null,
  customRatesGroupOptions: [],
  anniversaryBilling: false,
  promoApplied: false,
  driverInstructions: '',
  priceGroupOptions: [],
});

export const getTouchedSubscriptionMock = (): INewSubscription => ({
  ...getInitialSubscriptionMock(),
  poRequired: false,
  popupNote: '',
  grandTotal: 230,
  recurringGrandTotal: 40,
});

export const getSubscriptionWithLineItemsAndUpdatedSubOrdersMock = (): INewSubscription => ({
  ...getTouchedSubscriptionMock(),
  serviceItems: [
    getFirstServiceItemWithLineItemsAndUpdatedSubOrdersMock(),
    getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  ],
});

export const getSubscriptionWithUpdatedLineItemsAndSubOrdersMock = (): INewSubscription => ({
  ...getTouchedSubscriptionMock(),
  serviceItems: [
    getFirstServiceItemWithLineItemsAndSubOrdersMock(),
    getSecondServiceItemWithUpdatedLineItemsAndSubOrdersMock(),
  ],
});

export const getUpdatedSubscriptionMock = (): INewSubscription => ({
  ...getTouchedSubscriptionMock(),
  serviceItems: [
    getFirstServiceItemMock(),
    getUpdatedSecondServiceItemMock(),
    getAddedThirdServiceItemMock(),
  ],
});

export const getUpdatedSubscriptionWithItemsMock = (): INewSubscription => ({
  ...getInitialSubscriptionMock(),
  customerId: 44,
  jobSiteContactId: 54,
  orderContactId: 34,
  popupNote: '',
  grandTotal: 190,
  unlockOverrides: true,
  bestTimeToCome: 'pm',
  thirdPartyHaulerId: 2,
  driverInstructions: 'test',
  serviceItems: [
    getClosedFirstServiceItemWithLineItemsAndSubOrdersMock(),
    getUpdatedSecondServiceItemWithLineItemsAndSubOrdersMock(),
    getAddedThirdServiceItemWithLineItemsAndSubOrdersMock(),
  ],
});
