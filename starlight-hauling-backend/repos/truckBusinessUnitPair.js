import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'trucks_business_units';

class TruckBusinessUnit extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

TruckBusinessUnit.TABLE_NAME = TABLE_NAME;

export default TruckBusinessUnit;
