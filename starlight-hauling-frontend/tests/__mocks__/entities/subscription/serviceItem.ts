import { INewSubscriptionService } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  getAddedFourthLineItemMock,
  getAddedFourthSubscriptionOrderMock,
  getAddedThirdSubscriptionOrderMock,
  getClosedThirdLineItemMock,
  getFirstLineItemMock,
  getFirstSubscriptionOrderMock,
  getLineItemsWithMinorChangesMock,
  getOriginalLineItemsMock,
  getOriginalSubscriptionOrdersMock,
  getSubscriptionOrdersWithNewMock,
  getUpdatedSecondLineItemMock,
  getUpdatedSecondSubscriptionOrderMock,
} from '@tests/__mocks__';

export const getNewServiceItemMock = (): INewSubscriptionService => ({
  id: 1,
  serviceFrequencyOptions: [],
  lineItems: [],
  equipmentItemsMaterialsOptions: [],
  quantity: 1,
  effectiveDate: new Date('December 1, 2021 00:00:00'),
  serviceFrequencyId: 1,
  serviceDaysOfWeek: [],
  unlockOverrides: false,
  price: 1,
  subscriptionOrders: [],
  optionalSubscriptionOrders: [],
});

export const getFirstServiceItemMock = (): INewSubscriptionService => ({
  billableServiceId: 1809,
  customRatesGroupServicesId: undefined,
  effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
  globalRatesRecurringServicesId: 452,
  id: 7263,
  isDeleted: false,
  materialId: 11,
  optionalSubscriptionOrders: [],
  price: 125,
  quantity: 3,
  serviceDaysOfWeek: [],
  serviceFrequencyId: null,
  serviceFrequencyOptions: [],
  shortDescription: 'Luxury Toilets',
  showEffectiveDate: false,
  unlockOverrides: false,
  lineItems: [],
  subscriptionOrders: [],
  equipmentItemsMaterialsOptions: [],
});

const getFirstServiceItemWithMinorChangesMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemMock(),
  customRatesGroupServicesId: 5,
});

export const getUpdatedFirstServiceItemMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemMock(),
  globalRatesRecurringServicesId: 500,
  materialId: 14,
  quantity: 5,
  price: 145,
});

export const getClosedFirstServiceItemMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemMock(),
  quantity: 0,
});

export const getFirstServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemMock(),
  lineItems: getOriginalLineItemsMock(),
  subscriptionOrders: getOriginalSubscriptionOrdersMock(),
});

export const getUpdatedFirstServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getUpdatedFirstServiceItemMock(),
  lineItems: getLineItemsWithMinorChangesMock(),
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemMock(),
  lineItems: getLineItemsWithMinorChangesMock(),
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getFirstServiceItemWithLineItemsAndUpdatedSubOrdersMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemWithLineItemsAndSubOrdersMock(),
  subscriptionOrders: [
    getFirstSubscriptionOrderMock(),
    getUpdatedSecondSubscriptionOrderMock(),
    getAddedThirdSubscriptionOrderMock(),
  ],
});

export const getClosedFirstServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getFirstServiceItemWithLineItemsAndSubOrdersMock(),
  quantity: 0,
  lineItems: getLineItemsWithMinorChangesMock(),
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getSecondServiceItemMock = (): INewSubscriptionService => ({
  billableServiceId: 1810,
  customRatesGroupServicesId: 3,
  effectiveDate: new Date('2021-10-18T00:00:00.000Z'),
  globalRatesRecurringServicesId: 455,
  id: 7264,
  isDeleted: false,
  materialId: 12,
  optionalSubscriptionOrders: [],
  price: 135,
  quantity: 4,
  serviceDaysOfWeek: [],
  serviceFrequencyId: 2,
  serviceFrequencyOptions: [],
  shortDescription: 'Luxury Toilets 2',
  showEffectiveDate: false,
  unlockOverrides: false,
  lineItems: [],
  subscriptionOrders: [],
  equipmentItemsMaterialsOptions: [],
});

const getSecondServiceItemWithMinorChangesMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemMock(),
  shortDescription: 'test',
});

export const getUpdatedSecondServiceItemMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemMock(),
  serviceFrequencyId: 3,
  price: 170,
  unlockOverrides: true,
});

export const getClosedSecondServiceItemMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemMock(),
  quantity: 0,
});

export const getSecondServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemMock(),
  lineItems: getOriginalLineItemsMock(),
  subscriptionOrders: getOriginalSubscriptionOrdersMock(),
});

export const getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderMock = (): INewSubscriptionService => ({
  ...getUpdatedSecondServiceItemMock(),
  lineItems: getLineItemsWithMinorChangesMock(),
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock = () => ({
  ...getSecondServiceItemMock(),
  lineItems: [...getLineItemsWithMinorChangesMock(), getAddedFourthLineItemMock()],
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getSecondServiceItemWithUpdatedLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  lineItems: [
    getFirstLineItemMock(),
    getUpdatedSecondLineItemMock(),
    getClosedThirdLineItemMock(),
    getAddedFourthLineItemMock(),
  ],
});

export const getUpdatedSecondServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getUpdatedSecondServiceItemMock(),
  lineItems: [
    getFirstLineItemMock(),
    getUpdatedSecondLineItemMock(),
    getClosedThirdLineItemMock(),
    getAddedFourthLineItemMock(),
  ],
  subscriptionOrders: [
    getFirstSubscriptionOrderMock(),
    getUpdatedSecondSubscriptionOrderMock(),
    getAddedFourthSubscriptionOrderMock(),
  ],
});

export const getClosedSecondServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getSecondServiceItemWithLineItemsAndSubOrdersMock(),
  quantity: 0,
  lineItems: getLineItemsWithMinorChangesMock(),
  subscriptionOrders: getSubscriptionOrdersWithNewMock(),
});

export const getAddedThirdServiceItemMock = (): INewSubscriptionService => ({
  billableServiceId: 1840,
  customRatesGroupServicesId: 5,
  effectiveDate: new Date('2021-10-21T00:00:00.000Z'),
  globalRatesRecurringServicesId: 455,
  id: 0,
  isDeleted: false,
  materialId: 15,
  optionalSubscriptionOrders: [],
  price: 140,
  quantity: 3,
  serviceDaysOfWeek: [],
  serviceFrequencyId: 3,
  serviceFrequencyOptions: [],
  shortDescription: 'Luxury Toilets 5',
  showEffectiveDate: false,
  unlockOverrides: false,
  lineItems: [],
  subscriptionOrders: [],
  equipmentItemsMaterialsOptions: [],
});

export const getAddedThirdServiceItemWithLineItemsAndSubOrdersMock = (): INewSubscriptionService => ({
  ...getAddedThirdServiceItemMock(),
  lineItems: [getAddedFourthLineItemMock()],
  subscriptionOrders: [getAddedThirdSubscriptionOrderMock()],
});

export const getOriginalServiceItemsMock = (): INewSubscriptionService[] => [
  getFirstServiceItemMock(),
  getSecondServiceItemMock(),
];

export const getServiceItemsWithMinorChangesMock = (): INewSubscriptionService[] => [
  getFirstServiceItemWithMinorChangesMock(),
  getSecondServiceItemWithMinorChangesMock(),
];

export const getServiceItemsMock = (): INewSubscriptionService[] => [
  getUpdatedFirstServiceItemMock(),
  getUpdatedSecondServiceItemMock(),
];

export const getServiceItemsWithNewServiceItemMock = (): INewSubscriptionService[] => [
  getUpdatedFirstServiceItemMock(),
  getUpdatedSecondServiceItemMock(),
  getAddedThirdServiceItemMock(),
];

export const getClosedServiceItemsWithNewMock = (): INewSubscriptionService[] => [
  getClosedFirstServiceItemMock(),
  getClosedSecondServiceItemMock(),
  getAddedThirdServiceItemMock(),
];

export const getOriginalServiceItemsWithLineItemsAndSubOrdersMock = (): INewSubscriptionService[] => [
  getFirstServiceItemWithLineItemsAndSubOrdersMock(),
  getSecondServiceItemWithLineItemsAndSubOrdersMock(),
];

export const getServiceItemsWithLineItemsAndSubOrdersMock = (): INewSubscriptionService[] => [
  getUpdatedFirstServiceItemWithLineItemsAndSubOrdersMock(),
  getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderMock(),
];

export const getServiceItemsAndNewOneWithLineItemsAndSubOrdersMock = (): INewSubscriptionService[] => [
  getUpdatedFirstServiceItemWithLineItemsAndSubOrdersMock(),
  getUpdatedSecondServiceItemWithLineItemsAndNewSubOrderMock(),
  getAddedThirdServiceItemWithLineItemsAndSubOrdersMock(),
];

export const getServiceItemsWithUpdatedOnlyLineItemsAndSubOrdersMock = (): INewSubscriptionService[] => [
  getFirstServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock(),
  getSecondServiceItemWithUpdatedOnlyLineItemsAndSubOrdersMock(),
];

export const getClosedServiceItemsAndNewOneWithLineItemsAndSubOrdersMock = (): INewSubscriptionService[] => [
  getClosedFirstServiceItemWithLineItemsAndSubOrdersMock(),
  getClosedSecondServiceItemWithLineItemsAndSubOrdersMock(),
  getAddedThirdServiceItemWithLineItemsAndSubOrdersMock(),
];
