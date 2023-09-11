import { ISubscription, ISubscriptionDraft } from '@root/types';

export const getSubscriptionBillableServices = (
  subscription: ISubscription | ISubscriptionDraft,
) => {
  return subscription.serviceItems.flatMap(serviceItem => [
    serviceItem.billableService,
    ...serviceItem.subscriptionOrders.map(subscriptionOrder => subscriptionOrder.billableService),
  ]);
};
