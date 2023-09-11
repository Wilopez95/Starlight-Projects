import pick from 'lodash/fp/pick.js';

import { serviceItemFieldsForRecurringOrder } from '../../../consts/subscriptionOrders.js';

export const mapRecurringSubscriptionOrderForTemplate = ({
  subscription,
  serviceItem,
  useEffectiveDate,
  frequency,
  deliveryDate,
  finalDate,
}) => ({
  ...pick(serviceItemFieldsForRecurringOrder)(serviceItem),
  price: 0, // seems that recurring order can't have own price
  grandTotal: 0,
  subscriptionServiceItemId: serviceItem.id,
  startDate: (useEffectiveDate && serviceItem.effectiveDate) || subscription.startDate,
  endDate: subscription.endDate,
  instructionsForDriver: subscription.driverInstructions,
  jobSiteNote: subscription.jobSiteNote,
  jobSiteContactTextOnly: subscription.jobSiteContactTextOnly,
  bestTimeToComeFrom: subscription.bestTimeToComeFrom,
  bestTimeToComeTo: subscription.bestTimeToComeTo,
  someoneOnSite: subscription.someoneOnSite,
  highPriority: subscription.highPriority,
  frequencyType: frequency.type,
  frequencyOccurrences: frequency.times,
  serviceDaysOfWeek: serviceItem.serviceDaysOfWeek,
  deliveryDate,
  finalDate,
  canReschedule: true, // TODO: clarify with BA
  earlyPick: subscription.earlyPick,
  unlockOverrides: subscription.unlockOverrides,
  jobSiteContactId: subscription.jobSiteContactId,
  thirdPartyHaulerId: subscription.thirdPartyHaulerId,
  permitId: subscription.permitId,
  promoId: subscription.promoId,
  toRoll: subscription.toRoll,
  subscriptionContactId: subscription.subscriptionContactId,
  purchaseOrderId: subscription.purchaseOrderId,
  signatureRequired: subscription.signatureRequired,
  alleyPlacement: subscription.alleyPlacement,
  customRatesGroupId: subscription.customRatesGroupId,
  poRequired: subscription.poRequired,
  permitRequired: subscription.permitRequired,
});
