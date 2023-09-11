import compose from 'lodash/fp/compose.js';

import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'promos';

class PromoRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'code'];
  }

  getCurrentPromos({ condition = {}, fields = ['*'] }) {
    const today = new Date();
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .andWhere(builder =>
        builder
          .andWhereRaw('(start_date IS NULL OR start_date <= ?)', [today])
          .andWhereRaw('(end_date IS NULL OR end_date >= ?)', [today]),
      );
  }

  async getByIdToLog(id, trx = this.knex) {
    const query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    await super.populateBuBl({ query, selects });

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

PromoRepository.TABLE_NAME = TABLE_NAME;

export default PromoRepository;
