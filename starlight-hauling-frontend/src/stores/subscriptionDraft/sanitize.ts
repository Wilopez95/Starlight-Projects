import { formatTime } from '@root/helpers';
import { I18nStore } from '@root/i18n/I18nStore';
import { IConfigurableSubscriptionDraft } from '@root/types';

import { convertServiceDaysOfWeek } from '../subscription/helpers';
import { sanitizeEvents } from '../subscription/helpers/sanitizeEvents';

export const sanitizeConfigurableSubscriptionDraft = (
  configurableSubscriptionDraft: IConfigurableSubscriptionDraft,
  i18nStore: I18nStore,
) => {
  const { lineItems, subscriptionOrders, serviceItems } = sanitizeEvents(
    configurableSubscriptionDraft,
  );
  const { bestTimeToComeFrom, bestTimeToComeTo } = formatTime(configurableSubscriptionDraft);

  return {
    ...configurableSubscriptionDraft,
    bestTimeToComeFrom,
    bestTimeToComeTo,
    lineItems: lineItems?.map(lineItem => ({
      ...lineItem,
      price: lineItem.price,
    })),
    subscriptionOrders,
    serviceItems: serviceItems?.map(serviceItem => ({
      ...serviceItem,
      price: serviceItem.price,
      serviceDaysOfWeek: serviceItem.serviceDaysOfWeek
        ? convertServiceDaysOfWeek(serviceItem.serviceDaysOfWeek, i18nStore)
        : undefined,
    })),
  };
};
