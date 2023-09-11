import BaseRepository from './_base.js';

const TABLE_NAME = 'sales_rep_history';

class SalesRepHistoryRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getAllByBUIds({ ids, fields = ['*'] }, trx = this.knex) {
    return super
      .getAll(
        {
          fields,
        },
        trx,
      )
      .whereIn('businessUnitId', ids)
      .orderBy('id', 'desc');
  }
}

SalesRepHistoryRepository.TABLE_NAME = TABLE_NAME;

export default SalesRepHistoryRepository;
