import {
  pricingHttpClient,
  BaseService,
  haulingHttpClient,
  RequestQueryParams,
} from '@root/api/base';
import { ISubscriptionServiceItems } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { RequestOptions } from '@root/stores/subscription/types';
import {
  ICalculateSubscriptionPricesConfig,
  IReviewProration,
  ISubscription,
  ISubscriptionCalculations,
  ISubscriptionDraft,
  ISubscriptionHistoryRecord,
  ISubscriptionOnHoldDetails,
  ISubscriptionsAvailableFilters,
  SubscriptionStoreCountResponse,
} from '@root/types';

import { SubscriptionRequest } from './types';

export class SubscriptionService extends BaseService<
  SubscriptionRequest,
  ISubscription,
  SubscriptionStoreCountResponse
> {
  constructor() {
    super('subscriptions');
  }

  // eslint-disable-next-line class-methods-use-this
  requestHistoryById(subscriptionId: number) {
    return pricingHttpClient.get<ISubscriptionHistoryRecord[]>(
      `subscriptionHistory/${subscriptionId}/history`,
    );
  }

  requestGetPaginated(options: RequestQueryParams = {}) {
    return pricingHttpClient.get<ISubscription[]>(
      `${this.baseUrl}/subscription-paginated`,
      options,
    );
  }

  searchBy(query: string, options: RequestOptions) {
    const { filterData = {}, ...restOptions } = options;

    return pricingHttpClient.get<{ query: string }, ISubscription[] | ISubscriptionDraft[]>(
      `${this.baseUrl}/search`,
      {
        query,
        ...filterData,
        ...restOptions,
      },
    );
  }

  getAvailableFilters(businessUnitId: string) {
    return haulingHttpClient.get<ISubscriptionsAvailableFilters>(`${this.baseUrl}/filters`, {
      businessUnitId,
    }) as unknown as ISubscriptionsAvailableFilters; // response data doesn't have id, createdAt and updatedAt fields
  }

  getSubscriptionServiceItems(subscriptionId: number) {
    return haulingHttpClient.get<ISubscriptionServiceItems[]>(
      `${this.baseUrl}/${subscriptionId}/service-items`,
    );
  }

  putOnHold(subscriptionId: number, data: ISubscriptionOnHoldDetails) {
    return haulingHttpClient.patch<ISubscriptionOnHoldDetails>({
      url: `${this.baseUrl}/${subscriptionId}/put-on-hold`,
      data,
    });
  }

  resume(subscriptionId: number) {
    return haulingHttpClient.patch({
      url: `${this.baseUrl}/${subscriptionId}/put-off-hold`,
      data: null,
    });
  }

  calculatePrices(config: ICalculateSubscriptionPricesConfig, abortSignal?: AbortSignal) {
    return haulingHttpClient.post<ICalculateSubscriptionPricesConfig, ISubscriptionCalculations>(
      `${this.baseUrl}/calculate-prices`,
      config,
      undefined,
      abortSignal,
    );
  }

  reviewProration(subscriptionId: number, data: IReviewProration) {
    return haulingHttpClient.post<IReviewProration>(
      `${this.baseUrl}/${subscriptionId}/apply-proration-change`,
      data,
    );
  }
}
