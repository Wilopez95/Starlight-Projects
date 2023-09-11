import { IConfigurableSubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';
import { ISubscriptionWorkOrder } from '@root/types';

import { haulingHttpClient, RequestQueryParams } from '../base';

import { SubscriptionWorkOrderRequestRouteParams } from './types';

export class SubscriptionWorkOrderService {
  getBaseUrl({ subscriptionId, subscriptionOrderId }: SubscriptionWorkOrderRequestRouteParams) {
    return `subscriptions/${subscriptionId}/orders/${subscriptionOrderId}/work-orders`;
  }

  get(routeParams: SubscriptionWorkOrderRequestRouteParams, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<ISubscriptionWorkOrder[]>(this.getBaseUrl(routeParams), options);
  }

  getById(id: number, options: RequestQueryParams = {}) {
    return haulingHttpClient.get<ISubscriptionWorkOrder>(
      `subscriptions/work-orders/${id}`,
      options,
    );
  }

  update(workOrder: IConfigurableSubscriptionWorkOrder) {
    return haulingHttpClient.put<IConfigurableSubscriptionWorkOrder>({
      url: `subscriptions/work-orders/${workOrder.id}`,
      data: workOrder,
    });
  }
}
