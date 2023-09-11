// import { format } from 'date-fns';

import { formatTime } from '@root/helpers';
// import { dateFormatsEnUS } from '@root/i18n/format/date';
import { I18nStore } from '@root/i18n/I18nStore';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IConfigurableSubscription, ISanitizedConfigurableSubscription } from '@root/types';

import { sanitizeEvents } from './helpers/sanitizeEvents';
import { convertServiceDaysOfWeek } from './helpers';

export const sanitizeSubscription = (subscriptionData: INewSubscription, i18nStore: I18nStore) => {
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(subscriptionData);

  return {
    ...subscriptionData,
    thirdPartyHaulerId:
      subscriptionData.thirdPartyHaulerId === 0 ? null : subscriptionData.thirdPartyHaulerId,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    subscriptionContactId: subscriptionData.orderContactId || subscriptionData.jobSiteContactId,
    serviceItems: subscriptionData.serviceItems.map(serviceItem => ({
      ...serviceItem,
      price: serviceItem.price,
      lineItems: serviceItem.lineItems?.length ? serviceItem.lineItems : undefined,
      serviceDaysOfWeek: convertServiceDaysOfWeek(serviceItem.serviceDaysOfWeek, i18nStore),
    })),
  };
};

export const sanitizeConfigurableSubscription = (
  configurableSubscription: IConfigurableSubscription,
  i18nStore: I18nStore,
): ISanitizedConfigurableSubscription => {
  const { lineItems, subscriptionOrders, serviceItems } = sanitizeEvents(configurableSubscription);
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(configurableSubscription);

  const payload = {
    ...configurableSubscription,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    lineItems,
    subscriptionOrders,
    // convert it to utc date
    startDate: new Date(configurableSubscription.startDate),
    serviceItems: serviceItems?.map(serviceItem => ({
      ...serviceItem,
      serviceDaysOfWeek: serviceItem.serviceDaysOfWeek
        ? convertServiceDaysOfWeek(serviceItem.serviceDaysOfWeek, i18nStore)
        : undefined,
    })),
  };

  return payload;
};
