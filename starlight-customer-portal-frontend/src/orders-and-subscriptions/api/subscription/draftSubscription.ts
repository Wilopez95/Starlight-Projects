import { BaseService, haulingHttpClient } from '@root/core/api/base';
import { ISubscriptionDraft } from '@root/core/types';
import {
  RequestOptions,
  SubscriptionStoreCountResponse,
} from '@root/orders-and-subscriptions/stores/subscription/types';

import { SubscriptionRequest } from './types';

export class DraftSubscriptionService extends BaseService<
  SubscriptionRequest,
  ISubscriptionDraft,
  SubscriptionStoreCountResponse
> {
  constructor() {
    super('subscriptions/drafts');
  }

  searchBy(query: string, options: RequestOptions) {
    const { filterData = {}, ...restOptions } = options;

    return haulingHttpClient.get<{ query: string }, ISubscriptionDraft[]>(
      `${this.baseUrl}/search`,
      { query, ...filterData, ...restOptions },
    );
  }
}
