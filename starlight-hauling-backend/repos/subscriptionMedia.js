import { aggregateForInvoicing } from '../utils/media.js';
import MediaRepository from './_media.js';
import SubscriptionRepo from './subscription/subscription.js';
import SubscriptionServiceItemRepo from './subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionOrderRepo from './subscriptionOrder/subscriptionOrder.js';
import SubscriptionOrderMediaRepo from './subscriptionOrderMedia.js';
import SubWorkOrder from './subscriptionWorkOrder.js';
import SubWorkOrderMedia from './subscriptionWorkOrderMedia.js';

const TABLE_NAME = 'subscriptions_media';
const RELATION_NAME = 'subscriptionId';

class SubscriptionMediaRepository extends MediaRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME, relationName: RELATION_NAME });
  }

  async getMediaFilesForInvoicing(subscriptionIds, statuses) {
    const subTable = SubscriptionRepo.TABLE_NAME;
    const subServiceItemTable = SubscriptionServiceItemRepo.TABLE_NAME;
    const subOrderTable = SubscriptionOrderRepo.TABLE_NAME;
    const subOrderMediaTable = SubscriptionOrderMediaRepo.TABLE_NAME;
    const subWoOrderTable = SubWorkOrder.TABLE_NAME;
    const subWorkOrderMedia = SubWorkOrderMedia.TABLE_NAME;

    const result = this.knex(subTable)
      .withSchema(this.schemaName)
      .select(
        `${subOrderTable}.subscriptionId`,
        this.knex.raw(
          `COALESCE(
                        json_agg(
                        distinct jsonb_build_object(
                            'id', ${subOrderMediaTable}.id,
                            'url', ${subOrderMediaTable}.url,
                            'fileName', ${subOrderMediaTable}.file_name
                        )
                    ) FILTER (WHERE ${subOrderMediaTable}.id IS NOT NULL),
                    '[]'
                    ) as ??`,
          ['subOrderMediaFiles'],
        ),

        this.knex.raw(
          `COALESCE(
                        json_agg(
                        distinct jsonb_build_object(
                            'id', ${subWorkOrderMedia}.id,
                            'url', ${subWorkOrderMedia}.url,
                            'fileName', ${subWorkOrderMedia}.file_name
                        )
                    ) FILTER (WHERE ${subWorkOrderMedia}.id IS NOT NULL),
                    '[]'
                    ) as ??`,
          ['subWorkOrderMediaFiles'],
        ),
      )
      .innerJoin(subServiceItemTable, `${subTable}.id`, `${subServiceItemTable}.subscriptionId`)

      .leftJoin(
        subOrderTable,
        `${subServiceItemTable}.id`,
        `${subOrderTable}.subscriptionServiceItemId`,
      )

      .leftJoin(
        subOrderMediaTable,
        `${subOrderMediaTable}.subscriptionOrderId`,
        `${subOrderTable}.id`,
      )

      .leftJoin(subWoOrderTable, `${subWoOrderTable}.subscriptionOrderId`, `${subOrderTable}.id`)

      .leftJoin(
        subWorkOrderMedia,
        `${subWorkOrderMedia}.subscriptionWorkOrderId`,
        `${subWoOrderTable}.id`,
      )
      .leftJoin(this.tableName, `${this.tableName}.subscriptionId`, `${subTable}.id`)

      .whereIn(`${subOrderTable}.subscriptionId`, subscriptionIds)
      .whereIn(`${subOrderTable}.status`, statuses)
      .whereNull(`${subOrderTable}.deleted_at`)

      .groupBy([`${subOrderTable}.subscriptionId`]);

    const re2 = await result;
    return aggregateForInvoicing(re2);
  }
}

SubscriptionMediaRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionMediaRepository;
