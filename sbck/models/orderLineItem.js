import BaseModel from './_base.js';

export default class OrderLineItem extends BaseModel {
  static get tableName() {
    return 'orderLineItems';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['orderId', 'description', 'price', 'quantity', 'total', 'isService'],

      properties: {
        id: { type: 'integer' },
        orderId: { type: 'integer' },

        description: { type: 'string' },
        price: { type: 'number', min: 0 },
        quantity: { type: 'number' },
        total: { type: 'number', min: 0 },

        isService: { type: 'boolean' },
        billableServiceHistoricalId: { type: ['integer', null] },
        billableLineItemHistoricalId: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
    const { Order } = this.models;
    return {
      invoice: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.orderId`,
          to: `${Order.tableName}.id`,
        },
      },
    };
  }
}
