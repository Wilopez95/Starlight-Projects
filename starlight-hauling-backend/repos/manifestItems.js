import map from 'lodash/map.js';
import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';

import { camelCaseKeys } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import MaterialRepo from './material.js';
import OrderRepo from './order.js';
import WorkOrderRepo from './workOrder.js';

const TABLE_NAME = 'manifest_items';

class ManifestItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      // pre-pricing service refactor code:
      // super.mapNestedObjects.bind(this, ['quantity']),
      super.mapNestedObjects.bind(this, []),
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async populateManifestItemsByWorkOrderId(workOrderId, trx = this.knex) {
    const materialHT = MaterialRepo.getHistoricalTableName();

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`, trx.raw('to_json(??.*) as ??', [materialHT, 'material'])])

      .leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`)
      .where({ workOrderId })
      .groupBy([`${this.tableName}.id`, `${materialHT}.id`])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async populateManifestItemsByIds(ids, trx = this.knex) {
    const materialHT = MaterialRepo.getHistoricalTableName();

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`, trx.raw('to_json(??.*) as ??', [materialHT, 'material'])])

      .leftJoin(materialHT, `${materialHT}.id`, `${this.tableName}.materialId`)
      .whereIn(`${this.tableName}.id`, ids)
      .groupBy([`${this.tableName}.id`, `${materialHT}.id`])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async filterOut({ data, orderId, log }, trx = this.knex) {
    const updatedIds = map(data, 'id');
    if (!updatedIds?.length) {
      return;
    }

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .join(`${WorkOrderRepo.TABLE_NAME} as wo`, `wo.id`, `${this.tableName}.workOrderId`)
      .join(`${OrderRepo.TABLE_NAME} as o`, 'o.workOrderId', 'wo.id')
      .where({ 'o.id': orderId })
      .select(`${this.tableName}.id`);

    if (!isEmpty(updatedIds)) {
      query = query.whereNotIn(`${this.tableName}.id`, updatedIds);
    }

    const itemsToDelete = await query;
    const idsToDelete = map(itemsToDelete, 'id');

    if (!isEmpty(idsToDelete)) {
      await super.deleteByIds({ ids: idsToDelete, log }, trx);
    }
  }
}

ManifestItemRepository.TABLE_NAME = TABLE_NAME;

export default ManifestItemRepository;
