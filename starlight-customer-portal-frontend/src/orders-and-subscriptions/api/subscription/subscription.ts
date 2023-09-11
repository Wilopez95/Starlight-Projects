import { BaseService, haulingHttpClient } from '@root/core/api/base';
import { ISubscription } from '@root/core/types';
import { ISubscriptionServiceItems } from '@root/customer/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import {
  RequestOptions,
  SubscriptionStoreCountResponse,
} from '@root/orders-and-subscriptions/stores/subscription/types';

import { SubscriptionRequest } from './types';

export class SubscriptionService extends BaseService<
  SubscriptionRequest,
  ISubscription,
  SubscriptionStoreCountResponse
> {
  constructor() {
    super('subscriptions');
  }

  getSubscriptionServiceItems(subscriptionId: number) {
    return haulingHttpClient.get<ISubscriptionServiceItems[]>(
      `${this.baseUrl}/${subscriptionId}/service-items`,
    );
  }

  searchBy(query: string, options: RequestOptions) {
    const { filterData = {}, ...restOptions } = options;

    return haulingHttpClient.get<{ query: string }, ISubscription[]>(`${this.baseUrl}/search`, {
      query,
      ...filterData,
      ...restOptions,
    });
  }
}
