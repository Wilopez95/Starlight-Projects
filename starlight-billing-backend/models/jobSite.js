import BaseModel from './_base.js';

export default class JobSite extends BaseModel {
  static get tableName() {
    return 'job_sites';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['id', 'addressLine1', 'city', 'state', 'zip'],

      properties: {
        id: { type: 'integer' },
        name: { type: ['string', null] },
        addressLine1: { type: 'string', minLength: 1 },
        addressLine2: { type: ['string', null] },
        city: { type: 'string', minLength: 1 },
        state: { type: 'string' },
        zip: { type: 'string', minLength: 5 },
      },
    };
  }

  static get relationMappings() {
    const { Order } = this.models;
    return {
      orders: {
        relation: BaseModel.HasManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          to: `${Order.tableName}.jobSiteId`,
        },
      },
    };
  }
}
