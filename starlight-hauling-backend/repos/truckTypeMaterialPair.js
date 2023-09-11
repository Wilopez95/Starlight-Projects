import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'truck_types_materials';

class TruckTypeMaterialPair extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

TruckTypeMaterialPair.TABLE_NAME = TABLE_NAME;

export default TruckTypeMaterialPair;
