import MediaRepository from './_media.js';

const TABLE_NAME = 'subscription_work_orders_media';
const RELATION_NAME = 'subscriptionWorkOrderId';

class SubscriptionWorkOrderMediaRepository extends MediaRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME, relationName: RELATION_NAME });
    this.upsertConstraints = ['subscriptionWorkOrderId', 'url'];
  }

  async getUrlsBySubscriptionWorkOrderId(subscriptionWorkOrderId, trx = this.knex) {
    const images = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ subscriptionWorkOrderId })
      .select(['url']);

    return images;
  }

  // ToDo: Modificar este endpoint para que tome informacion de pricing backend
  // By: Esteban Navarro || Ticket: PS-230
  async getAllGroupedByWorkOrder(subscriptionWorkOrdersIds, trx = this.knex) {
    const groupedMediaFiles = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('subscriptionWorkOrderId', subscriptionWorkOrdersIds)
      .select([
        trx.raw(
          `json_agg(
                        json_build_object('id', id, 'url', url, 'fileName', file_name)
                    ) as media`,
        ),
        'subscriptionWorkOrderId',
      ])
      .groupBy('subscriptionWorkOrderId');

    if (!groupedMediaFiles) {
      return [];
    }

    return groupedMediaFiles;
  }
}

SubscriptionWorkOrderMediaRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionWorkOrderMediaRepository;
