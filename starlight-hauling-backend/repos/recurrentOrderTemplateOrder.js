import { ORDER_STATUS } from '../consts/orderStatuses.js';
import BaseRepository from './_base.js';
import OrderRepository from './order.js';

const TABLE_NAME = 'recurrent_order_template_order';

class RecurrentOrderTemplateOrderRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async countNotFinalized({ condition: { recurrentOrderTemplateId } }, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(
        OrderRepository.TABLE_NAME,
        `${this.tableName}.orderId`,
        `${OrderRepository.TABLE_NAME}.id`,
      )
      .whereIn(`${OrderRepository.TABLE_NAME}.status`, [
        ORDER_STATUS.inProgress,
        ORDER_STATUS.completed,
        ORDER_STATUS.approved,
      ])
      .andWhere({ recurrentOrderTemplateId })
      .count(`${this.tableName}.id`)
      .first();

    return Number(result?.count || 0);
  }

  async getRecurrentTemplateByOrderId(
    { condition: { orderId }, fields = ['recurrentOrderTemplateId', 'createdAt'] },
    trx = this.knex,
  ) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .where({ orderId })
      .select(fields)
      .first();

    return result;
  }
}

RecurrentOrderTemplateOrderRepository.TABLE_NAME = TABLE_NAME;

export default RecurrentOrderTemplateOrderRepository;
