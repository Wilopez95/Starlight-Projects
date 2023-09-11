import BaseRepository from './_base.js';

const TABLE_NAME = 'billable_line_item_material';

class BillableLineItemMaterialRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  deleteByLineItemIdAndMaterialIds({ data }) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where('billableLineItemId', data.billableLineItemId)
      .whereIn('materialId', data.materialIds)
      .del();
  }
}

BillableLineItemMaterialRepository.TABLE_NAME = TABLE_NAME;

export default BillableLineItemMaterialRepository;
