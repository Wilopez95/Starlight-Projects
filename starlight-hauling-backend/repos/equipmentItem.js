import compose from 'lodash/fp/compose.js';

import { SORT_ORDER } from '../consts/sortOrders.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'equipment_items';

class EquipmentItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(super.camelCaseKeys, super.mapFields)(originalObj);
  }

  async getFirstSorted({ fields = ['*'] }, trx = this.knex) {
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .orderBy(`${this.tableName}.id`, SORT_ORDER.desc)
      .first();

    const result = await query;
    return result;
  }

  async getByIdToLog(id, trx = this.knex) {
    const query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    await super.populateBl({ query, selects });

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

EquipmentItemRepository.TABLE_NAME = TABLE_NAME;

export default EquipmentItemRepository;
