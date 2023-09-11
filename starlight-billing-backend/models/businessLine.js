import BaseModel from './_base.js';

export default class BusinessLine extends BaseModel {
  static get tableName() {
    return 'business_lines';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['id', 'name', 'active', 'type'],

      properties: {
        id: { type: 'integer' },
        active: { type: 'boolean' },
        name: { type: 'string' },
        description: { type: ['string', null] },
        type: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const { Order, Subscription } = this.models;

    return {
      orders: {
        relation: this.HasManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          to: `${Order.tableName}.businessLineId`,
        },
      },
      subscriptions: {
        relation: this.HasManyRelation,
        modelClass: Subscription,
        join: {
          from: `${this.tableName}.id`,
          to: `${Subscription.tableName}.businessLineId`,
        },
      },
    };
  }

  static async upsertOne(data) {
    const trx = await this.startTransaction();

    let lineOfBusiness;
    try {
      lineOfBusiness = await this.query(trx).upsertGraphAndFetch(data, {
        insertMissing: true,
        noDelete: true,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return lineOfBusiness;
  }
}
