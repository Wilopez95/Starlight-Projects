import { RequestOptions } from '@root/stores/subscription/types';
import {
  IStoreCount,
  ISubscription,
  ISubscriptionDraft,
  ISubscriptionsAvailableFilters,
} from '@root/types';

import { BaseService, haulingHttpClient } from '../base';

import { SubscriptionRequest } from './types';

export class DraftSubscriptionService extends BaseService<
  SubscriptionRequest,
  ISubscriptionDraft,
  IStoreCount
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

  getAvailableFilters(businessUnitId: string) {
    return haulingHttpClient.get<ISubscriptionsAvailableFilters>(`${this.baseUrl}/filters`, {
      businessUnitId,
    }) as unknown as ISubscriptionsAvailableFilters; // response data doesn't have id, createdAt and updatedAt fields
  }

  updateToActive<Resp = ISubscription>(id: number, entity: Partial<SubscriptionRequest> | null) {
    const concurrentData = { [id]: entity?.updatedAt };
    return haulingHttpClient.patch<SubscriptionRequest, Resp>({
      url: `${this.baseUrl}/${id}/update-to-active`,
      data: entity,
      concurrentData,
    });
  }
}
