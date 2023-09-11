import BaseRepository from './_base.js';

const TABLE_NAME = 'customer_job_site_pairs_purchase_orders';

class CustomerJobsitePurchaseOrderRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['purchaseOrderId', 'customerJobSitePairId'];
  }
}

CustomerJobsitePurchaseOrderRepository.TABLE_NAME = TABLE_NAME;

export default CustomerJobsitePurchaseOrderRepository;
