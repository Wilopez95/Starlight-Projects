import { v4 as uuidv4 } from 'uuid';
import isEmpty from 'lodash/isEmpty.js';

import MediaRepository from './_media.js';

const TABLE_NAME = 'independent_work_orders_media';
const RELATION_NAME = 'independentWorkOrderId';

class IndependentWorkOrderMediaRepository extends MediaRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME, relationName: RELATION_NAME });
    this.upsertConstraints = ['independentWorkOrderId', 'url'];
  }

  async upsertMany({ data: dataArr = [], independentWorkOrderId }, trx) {
    const ids = dataArr.filter(item => item.id).map(item => item.id);
    await super.deleteBy(
      {
        condition: { independentWorkOrderId },
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

    const mediaFiles = dataArr.map(item => ({
      ...item,
      independentWorkOrderId,
      id: uuidv4(),
    }));

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

IndependentWorkOrderMediaRepository.TABLE_NAME = TABLE_NAME;

export default IndependentWorkOrderMediaRepository;
