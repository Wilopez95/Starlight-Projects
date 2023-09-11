import BaseModel from './_base.js';

export default class ReversedPayment extends BaseModel {
  static get tableName() {
    return 'reverse_payments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['paymentId', 'date', 'type', 'amount'],

      properties: {
        id: { type: 'integer' },
        paymentId: { type: 'integer' },
        date: { type: 'string' },
        type: { type: 'string' },
        note: { type: ['string', null] },
        amount: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    const { Payment } = this.models;
    return {
      payment: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.paymentId`,
          to: `${Payment.tableName}.id`,
        },
      },
    };
  }

  static async getAllCreatedInRange({ customerId, from, to, fields = ['*'] } = {}) {
    const items = await this.query()
      .andWhere(this.ref('createdAt'), '<=', to)
      .andWhere(this.ref('createdAt'), '>=', from)
      .whereExists(this.relatedQuery('payment').where({ customerId }).select(1))
      .select(fields);

    return items;
  }

  static async getQBData({ condition: { rangeFrom, rangeTo, customerIds } = {} }) {
    const trx = this.knex();
    let query = this.query(trx)
      .joinRelated('payment as p')
      .select([
        this.raw(`${this.tableName}.id reversePaymentId`),
        this.raw(`p.customer_id customerId`),
        this.raw(`${this.tableName}.amount reversePaymentTotal`),
      ]);

    if (rangeFrom) {
      query = query.andWhere(`${this.tableName}.createdAt`, '>', rangeFrom);
    }

    if (rangeTo) {
      query = query.andWhere(`${this.tableName}.createdAt`, '<=', rangeTo);
    }

    if (customerIds?.length) {
      query = query.whereIn(`p.customer_id`, customerIds);
    }

    query = query.orderBy(`${this.tableName}.id`);
    return query;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[payment]');

    return item ? super.castNumbers(item) : null;
  }
}
