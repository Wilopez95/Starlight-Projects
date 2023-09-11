import compose from 'lodash/fp/compose.js';

import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'billable_surcharges';

class BillableSurchargeRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessLineId', 'description'];
  }

  async getByIdToLog(id, trx = this.knex) {
    const query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    await super.populateBl({ query, selects });

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

BillableSurchargeRepository.TABLE_NAME = TABLE_NAME;

export default BillableSurchargeRepository;
