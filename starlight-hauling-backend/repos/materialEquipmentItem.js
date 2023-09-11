import BaseRepository from './_base.js';

const TABLE_NAME = 'material_equipment_item';

class MaterialEquipmentItemRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  deleteByMaterialIdAndEquipmentItemIds({ data }) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where('materialId', data.materialId)
      .whereIn('equipmentItemId', data.equipmentItemIds)
      .del();
  }
}

MaterialEquipmentItemRepository.TABLE_NAME = TABLE_NAME;

export default MaterialEquipmentItemRepository;
