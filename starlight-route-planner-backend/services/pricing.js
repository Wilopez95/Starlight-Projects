import HaulingRoutePlannerEntitiesMapper from '../mappers/HaulingRoutePlannerEntitiesMapper.js';
import { makePricingRequest } from '../utils/makeRequest.js';

export class PricingService {
  // static async getSubscriptionOrder({ ctx = {}, data = {}, id }) {
  //   return makePricingRequest(ctx, {
  //     method: 'get',
  //     url: `subscriptions/orders/${id}`,
  //     data
  //   }
  //     );
  // }

  static async getIndependentOrder({ ctx = {}, data = {}, id }) {
    const order = await makePricingRequest(ctx, {
      method: 'get',
      url: `/orders/by?id=${id}`,
      data,
    });
    const result = {
      ...order[0],
      status: HaulingRoutePlannerEntitiesMapper.mapLowercaseStatus(order[0].status),
    };

    return result;
  }

  static async getParentOrder(isIndependent, { schemaName, id }) {
    const getOrder = isIndependent ? this.getIndependentOrder : this.getSubscriptionOrder;

    return getOrder({ schemaName, id });
  }
}
