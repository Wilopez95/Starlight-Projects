import BaseRepository from './_base.js';

const TABLE_NAME = 'purchase_orders_business_lines';

class PurchaseOrderBusinessLineRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['purchaseOrderId', 'businessLineId'];
  }
}

PurchaseOrderBusinessLineRepository.TABLE_NAME = TABLE_NAME;

export default PurchaseOrderBusinessLineRepository;
