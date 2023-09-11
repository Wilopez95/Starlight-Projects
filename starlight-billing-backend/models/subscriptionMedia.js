import BaseModel from './_base.js';

export default class SubscriptionMedia extends BaseModel {
  static get tableName() {
    return 'subscriptions_media';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['fileName', 'url'],

      properties: {
        id: { type: 'string' },
        url: { type: 'string' },
        fileName: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const { Subscription } = this.models;
    return {
      order: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Subscription,
        join: {
          from: `${this.tableName}.subscriptionId`,
          to: `${Subscription.tableName}.id`,
        },
      },
    };
  }
}
