import { addDays, nextMonday } from 'date-fns';

import { ensureUtc } from '../../../../../tests/e2e/utils/ensureUtc.js';

import { deliveryServiceInputDefault, subscriptionInputCommonFieldsDefault } from './common.js';
import { newSubscriptionDeliveryDate } from './addSubscription.js';

export const addedSubscriptionDeliveryDate = ensureUtc(nextMonday(newSubscriptionDeliveryDate));
export const editedServiceItemEffectiveDate = ensureUtc(addDays(addedSubscriptionDeliveryDate, 2));

export const editedSubscriptionOrderInputDefault = {
  eventType: 'edit',
  unlockOverrides: true,
};
export const addedSubscriptionOrderInputDefault = {
  ...deliveryServiceInputDefault,
  eventType: 'add',
  quantity: 1,
  unlockOverrides: true,
  serviceDate: addedSubscriptionDeliveryDate.toISOString(),
  isFinalForService: false,
};

export const updatedServiceItemInputDefault = {
  eventType: 'edit',
  effectiveDate: editedServiceItemEffectiveDate.toISOString(),
  quantity: 2,
};
export const updatedSubscriptionInputDefault = {
  ...subscriptionInputCommonFieldsDefault,
  jobSiteContactTextOnly: false,
  driverInstructions: null,
  permitId: null,
  thirdPartyHaulerId: null,
  endDate: null,
  customRatesGroupId: null,
  csrComment: null,
  serviceItems: [updatedServiceItemInputDefault],
  subscriptionOrders: [editedSubscriptionOrderInputDefault, addedSubscriptionOrderInputDefault],
};
