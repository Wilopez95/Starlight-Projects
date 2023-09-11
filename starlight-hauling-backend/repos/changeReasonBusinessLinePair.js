import BaseRepository from './_base.js';

const TABLE_NAME = 'change_reasons_business_lines';

class ChangeReasonBusinessLinePair extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

ChangeReasonBusinessLinePair.TABLE_NAME = TABLE_NAME;

export default ChangeReasonBusinessLinePair;
