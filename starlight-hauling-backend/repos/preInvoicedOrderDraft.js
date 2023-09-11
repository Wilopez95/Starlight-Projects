import compose from 'lodash/fp/compose.js';

import BaseRepository from './_base.js';

const TABLE_NAME = 'pre_invoiced_order_drafts';

class PreInvoicedOrderDraftRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(obj) {
    return compose(super.camelCaseKeys, super.mapFields)(obj);
  }

  deleteByOrderIds({ condition: { orderIds = [] } } = {}, trx = this.knex) {
    return trx(this.tableName).withSchema(this.schemaName).whereIn('orderId', orderIds).delete();
  }

  async getAllByOrdersIds({ condition: { orderIds = [] }, fields = ['*'] } = {}, trx = this.knex) {
    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('orderId', orderIds)
      .select(fields);

    return items ?? [];
  }

  insertMany({ data }, trx = this.knex) {
    return trx(this.tableName).withSchema(this.schemaName).insert(data);
  }
}

PreInvoicedOrderDraftRepository.TABLE_NAME = TABLE_NAME;

export default PreInvoicedOrderDraftRepository;
