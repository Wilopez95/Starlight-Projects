import BaseModel from './_base.js';

export default class SubscriptionInvoicedEntity extends BaseModel {
  static get tableName() {
    return 'subscription_invoiced_entities';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['serviceName', 'price', 'quantity'],

      properties: {
        id: { type: 'integer' },
        serviceName: { type: ['string', null] },

        price: { type: ['number', null] },
        quantity: { type: ['number', null] },
        totalPrice: { type: 'number' },
        totalDay: { type: 'number' },
        grandTotal: { type: ['number', null] },

        usageDay: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    return {
      invoiceSubscription: {
        relation: BaseModel.BelongsToOneRelation,
        join: {
          from: `${this.tableName}.subscriptionInvoiceId`,
          to: 'subscriptionInvoice.id',
        },
      },
    };
  }

  static async create({ data }, trx) {
    const result = await this.query(trx).insertGraph(data);

    return result;
  }
}
