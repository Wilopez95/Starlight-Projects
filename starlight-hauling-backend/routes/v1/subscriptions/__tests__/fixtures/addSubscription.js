import { nextMonday, addDays, startOfMonth, addMonths, startOfToday } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import { ensureUtc } from '../../../../../tests/e2e/utils/ensureUtc.js';

import {
  deliveryServiceInputDefault,
  servicingServiceInputDefault,
  subscriptionInputCommonFieldsDefault,
} from './common.js';

const { zonedTimeToUtc } = dateFnsTz;
export const newSubscriptionDeliveryDate = zonedTimeToUtc(nextMonday(startOfToday()), 'UTC');
export const newSubscriptionStartDate = ensureUtc(addDays(newSubscriptionDeliveryDate, 2));
export const newSubscriptionFirstPeriodEndDate = ensureUtc(
  zonedTimeToUtc(addMonths(startOfMonth(newSubscriptionStartDate), 1), 'UTC'),
);

export const newSubscriptionOrderInputDefault = {
  ...deliveryServiceInputDefault,
  id: 0,
  quantity: 1,
  unlockOverrides: false,
  serviceDate: newSubscriptionDeliveryDate.toISOString(),
  isFinalForService: false,
};

export const newServiceItemInputDefault = {
  ...servicingServiceInputDefault,

  unlockOverrides: false,
  quantity: 1,
  effectiveDate: null,
  showEffectiveDate: false,
  subscriptionOrders: [newSubscriptionOrderInputDefault],
  billingCycle: 'monthly',
  prorationEffectiveDate: newSubscriptionStartDate.toISOString(),
  prorationEffectivePrice: 5.2,
  prorationOverride: false,
};

export const newSubscriptionInputDefault = {
  ...subscriptionInputCommonFieldsDefault,

  startDate: newSubscriptionStartDate.toISOString(),
  periodFrom: newSubscriptionStartDate.toISOString(),
  periodTo: newSubscriptionFirstPeriodEndDate.toISOString(),
  jobSiteId: 99,
  customerJobSiteId: 3859,
  billingCycle: 'monthly',
  businessUnitId: '21',
  businessLineId: '2',
  poRequired: false,
  permitRequired: false,
  signatureRequired: false,
  alleyPlacement: false,
  promoApplied: false,
  someoneOnSite: false,
  serviceItems: [newServiceItemInputDefault],
  bestTimeToCome: 'any',
  billingType: 'arrears',
  anniversaryBilling: false,
  minBillingPeriods: null,
  serviceAreaId: 55,
  equipmentType: 'waste_container',
};
