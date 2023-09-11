import BaseRepository from './_base.js';

const SCHEMA_NAME = 'admin';
const TABLE_NAME = 'clock_in_out';

class ClockInOutRepository extends BaseRepository {
  constructor(ctxState) {
    super(ctxState, { schemaName: SCHEMA_NAME, tableName: TABLE_NAME });
  }

  getBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .orderBy('id', 'desc')
      .first();
  }
}

ClockInOutRepository.TABLE_NAME = TABLE_NAME;
ClockInOutRepository.SCHEMA_NAME = SCHEMA_NAME;

export default ClockInOutRepository;
