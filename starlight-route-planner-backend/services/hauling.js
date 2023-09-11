import { makeHaulingRequest, makeHaulingUploadMediaRequest } from '../utils/makeRequest.js';
import HaulingRoutePlannerEntitiesMapper from '../mappers/HaulingRoutePlannerEntitiesMapper.js';
import { RESPONSE_STATUS } from '../consts/responseStatus.js';

// TODO: need to add some sort of caching, since these values are rarely changed
// and frequently requested on publish master routes
export class HaulingService {
  static async getAllBusinessLines({ schemaName }) {
    return makeHaulingRequest(
      {},
      {
        method: 'get',
        url: '/business-lines',
      },
      {
        schemaName,
      },
    );
  }

  static async getSubscriptionOrder({ schemaName, id }) {
    return makeHaulingRequest(
      {},
      {
        method: 'get',
        url: `subscriptions/orders/${id}`,
      },
      {
        schemaName,
      },
    );
  }

  static async getIndependentOrder({ schemaName, id }) {
    const order = await makeHaulingRequest(
      {},
      {
        method: 'get',
        url: `orders/${id}`,
      },
      {
        schemaName,
      },
    );

    const result = {
      ...order,
      status: HaulingRoutePlannerEntitiesMapper.mapLowercaseStatus(order.status),
    };

    return result;
  }

  static async getParentOrder(isIndependent, { schemaName, id }) {
    const getOrder = isIndependent ? this.getIndependentOrder : this.getSubscriptionOrder;

    return getOrder({ schemaName, id });
  }

  static async getServiceAreas({ schemaName, ids }) {
    return makeHaulingRequest(
      {},
      {
        method: 'post',
        url: `service-areas/ids`,
        data: {
          ids,
        },
      },
      {
        schemaName,
      },
    );
  }

  static async getDriverInfo({ schemaName, id }) {
    return makeHaulingRequest(
      {},
      {
        method: 'get',
        url: `drivers/${id}`,
      },
      {
        schemaName,
      },
    );
  }

  static async getTruckInfo({ schemaName, id }) {
    return makeHaulingRequest(
      {},
      {
        method: 'get',
        url: `trucks/${id}`,
      },
      {
        schemaName,
      },
    );
  }

  static async uploadSubscriptionWorkOrderMedia({ ctx, id, input }) {
    return makeHaulingUploadMediaRequest(ctx, {
      method: 'post',
      url: `subscriptions/work-orders-media/${id}`,
      input,
    });
  }

  static async uploadIndependentWorkOrderMedia({ ctx, id, input }) {
    return makeHaulingUploadMediaRequest(ctx, {
      method: 'post',
      url: `orders/media/${id}`,
      input,
    });
  }

  static async uploadWorkOrderMedia(isIndependent, { ctx, id, input }) {
    const uploadMedia = isIndependent
      ? this.uploadIndependentWorkOrderMedia
      : this.uploadSubscriptionWorkOrderMedia;

    return uploadMedia({ ctx, id, input });
  }

  static async syncJobSitesFromHauling({ schemaName }) {
    await makeHaulingRequest(
      {},
      {
        method: 'post',
        url: '/admin/sync/job-sites',
        data: {
          schemaName,
        },
      },
    );

    return { status: RESPONSE_STATUS.success, message: 'All job sites synced successfully' };
  }
}
