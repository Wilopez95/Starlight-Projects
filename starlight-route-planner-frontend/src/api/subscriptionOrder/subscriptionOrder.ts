import { SubscriptionOrderStatus } from '@root/types';

import { BaseGraphqlService } from '../base';

export class SubscriptionOrderService extends BaseGraphqlService {
  getSubscriptionOrderStatus(subscriptionOrderId: number) {
    return this.graphql<
      {
        haulingSubscriptionOrder: {
          id: number;
          status: SubscriptionOrderStatus;
        };
      },
      {
        subscriptionOrderId: number;
      }
    >(
      `
        query HaulingSubscriptionOrder($subscriptionOrderId: Int!) {
          haulingSubscriptionOrder(id: $subscriptionOrderId) {
            id
            status
          }
        }
      `,
      {
        subscriptionOrderId,
      },
    );
  }
}
