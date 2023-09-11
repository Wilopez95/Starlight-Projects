import { compact } from 'lodash-es';

import { ISubscription, ISubscriptionDraft } from '@root/types';

export const getSubscriptionBillableLineItems = (
  subscription: ISubscription | ISubscriptionDraft,
) => {
  return subscription.serviceItems.flatMap(serviceItem =>
    compact(serviceItem.lineItems.map(lineItem => lineItem.billableLineItem)),
  );
};
