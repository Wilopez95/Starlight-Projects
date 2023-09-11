import { IndependentOrderStatus } from '@root/types';

import { BaseGraphqlService } from '../base';

export class IndependentOrderService extends BaseGraphqlService {
  getIndependentOrderStatus(independentOrderId: number) {
    return this.graphql<
      {
        haulingIndependentOrder: { id: number; status: IndependentOrderStatus };
      },
      {
        independentOrderId: number;
      }
    >(
      `
        query HaulingIndependentOrder($independentOrderId: Int!) {
          haulingIndependentOrder(id: $independentOrderId) {
            id
            status
          }
        }
      `,
      {
        independentOrderId,
      },
    );
  }
}
