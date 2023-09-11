import isEmpty from 'lodash/isEmpty.js';
import MediaRepository from './_media.js';

const TABLE_NAME = 'subscription_orders_media';
const RELATION_NAME = 'subscriptionOrdersId';

class SubscriptionOrderMediaRepository extends MediaRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME, relationName: RELATION_NAME });
    this.upsertConstraints = ['subscriptionOrderId', 'url'];
  }

  async upsertMany({ data: dataArr = [], subscriptionOrderId }, trx) {
    const ids = dataArr.filter(item => item.id).map(item => item.id);
    await super.deleteBy(
      {
        condition: { subscriptionOrderId },
        whereNotIn: [
          {
            key: 'id',
            values: ids,
          },
        ],
      },
      trx,
    );

    let upsertItems;

    const mediaFiles = dataArr.map(item => ({ ...item, subscriptionOrderId }));

    if (!isEmpty(dataArr)) {
      upsertItems = await super.upsertMany(
        {
          data: mediaFiles,
        },
        trx,
      );
    }

    return upsertItems;
  }
}

SubscriptionOrderMediaRepository.TABLE_NAME = TABLE_NAME;

export default SubscriptionOrderMediaRepository;
