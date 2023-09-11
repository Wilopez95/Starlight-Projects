import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'truck_types_business_lines';

class TruckTypeBusinessLinePair extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

TruckTypeBusinessLinePair.TABLE_NAME = TABLE_NAME;

export default TruckTypeBusinessLinePair;
