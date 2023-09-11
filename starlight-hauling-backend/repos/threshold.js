import compose from 'lodash/fp/compose.js';

import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'thresholds';

class ThresholdRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessLineId', 'type'];
  }

  getAll(
    { condition = {}, businessLineIds, fields = ['*'], orderBy = 'id' } = {},
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(condition)
      .select(fields)
      .orderBy(orderBy);

    if (businessLineIds) {
      query = query.whereIn('businessLineId', businessLineIds);
    }

    return query;
  }

  async getByIdToLog(id, trx = this.knex) {
    const query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    await super.populateBl({ query, selects });

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

ThresholdRepository.TABLE_NAME = TABLE_NAME;

export default ThresholdRepository;
