import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'drivers_business_units';

class DriverBusinessUnit extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

DriverBusinessUnit.TABLE_NAME = TABLE_NAME;

export default DriverBusinessUnit;
