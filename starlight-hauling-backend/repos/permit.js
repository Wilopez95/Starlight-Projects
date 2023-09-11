import compose from 'lodash/fp/compose.js';

import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'permits';

class PermitRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'number'];
  }

  getCurrentPermits({ condition = {}, fields = ['*'] }) {
    const today = new Date();
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .andWhere(builder =>
        builder.whereNull('expirationDate').orWhere('expirationDate', '>=', today),
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

PermitRepository.TABLE_NAME = TABLE_NAME;

export default PermitRepository;
