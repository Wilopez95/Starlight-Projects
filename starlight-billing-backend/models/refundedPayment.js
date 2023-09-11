import BaseModel from './_base.js';

export default class RefundedPayment extends BaseModel {
  static get tableName() {
    return 'refund_payments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['paymentId', 'amount'],

      properties: {
        id: { type: 'integer' },
        type: { type: 'string' },
        amount: { type: 'number' },

        onAccountPaymentId: { type: ['integer', null] },
        paymentId: { type: 'integer' },
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
}
