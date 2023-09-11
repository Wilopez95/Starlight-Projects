import BaseModel from './_base.js';

export default class MediaFile extends BaseModel {
  static get tableName() {
    return 'media_files';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['fileName', 'url', 'orderId'],

      properties: {
        id: { type: 'integer' },
        url: { type: 'string' },
        fileName: { type: 'string' },
        orderId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const { Order } = this.models;
    return {
      order: {
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
