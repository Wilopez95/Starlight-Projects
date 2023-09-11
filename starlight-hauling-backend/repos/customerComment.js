import { SORT_ORDER } from '../consts/sortOrders.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'customer_comments';

class CustomerCommentRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllComments(
    { condition: { customerId }, fields = ['*'] },
    // userFields = ['firstName', 'lastName'] },
    trx = this.knex,
  ) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .where({ customerId })
      .orderBy(`${this.tableName}.id`, SORT_ORDER.desc);

    return items?.length ? items : [];
  }
}

CustomerCommentRepository.TABLE_NAME = TABLE_NAME;

export default CustomerCommentRepository;
