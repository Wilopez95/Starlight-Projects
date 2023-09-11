import BaseRepository from './_base.js';

const TABLE_NAME = 'work_orders_suspended';

class WorkOrdersSuspendedRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async insertMany(workOrderId, { data, fields = ['id'] }, trx) {
    await super.deleteBy({ condition: { workOrderId } }, trx);
    return super.insertMany({ data, fields }, trx);
  }
}

WorkOrdersSuspendedRepository.TABLE_NAME = TABLE_NAME;

export default WorkOrdersSuspendedRepository;
