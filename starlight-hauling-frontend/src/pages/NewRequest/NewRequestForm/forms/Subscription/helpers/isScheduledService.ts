import { isFuture } from 'date-fns';

import { SubscriptionOrderStatusEnum } from '@root/types';

import { INewSubscriptionService } from '../types';

export const isScheduledService = (serviceItem: INewSubscriptionService) => {
  return serviceItem.subscriptionOrders.every(
    subscriptionOrder =>
      subscriptionOrder.serviceDate &&
      isFuture(subscriptionOrder.serviceDate) &&
      subscriptionOrder.status === SubscriptionOrderStatusEnum.scheduled,
  );
};
