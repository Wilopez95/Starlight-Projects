import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'truck_types_equipment_items';

class TruckTypeEquipmentItemPair extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

TruckTypeEquipmentItemPair.TABLE_NAME = TABLE_NAME;

export default TruckTypeEquipmentItemPair;
