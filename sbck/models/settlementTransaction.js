import BaseModel from './_base.js';

export default class SettlementTransaction extends BaseModel {
  static get tableName() {
    return 'settlementTransactions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['settlementId', 'ccRetref', 'amount', 'fee', 'adjustment'],

      properties: {
        id: { type: 'integer' },
        settlementId: { type: 'integer' },

        ccRetref: { type: 'string' },
        amount: { type: 'number' },
        fee: { type: 'number' },
        adjustment: { type: 'number' },
        transactionNote: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { Settlement, Payment } = this.models;
    return {
      settlement: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Settlement,
        join: {
          from: `${this.tableName}.settlementId`,
          to: `${Settlement.tableName}.id`,
        },
      },
      payment: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Payment,
        join: {
          from: `${this.tableName}.ccRetref`,
          to: `${Payment.tableName}.ccRetref`,
        },
      },
    };
  }

  static async getAllPaginated({ condition: { settlementId }, limit, offset }) {
    const items = await this.query()
      .withGraphJoined('payment.customer')
      .withGraphJoined('settlement')
      .whereRaw(`settlement.sp_used = settlement_transactions.sp_used`)
      .andWhere({ settlementId })
      .limit(limit)
      .offset(offset);

    return items;
  }
}
