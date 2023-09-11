import BaseModel from './_base.js';

export default class SubscriptionInvoice extends BaseModel {
  static get tableName() {
    return 'subscriptions_invoices';
  }

  static get jsonSchema() {
    return {
      type: 'object',
    };
  }

  static get relationMappings() {
    const { SubscriptionInvoicedEntity } = this.models;
    return {
      subscriptionInvoicedEntity: {
        relation: BaseModel.HasManyRelation,
        modelClass: SubscriptionInvoicedEntity,
        join: {
          from: `${this.tableName}.id`,
          to: `${SubscriptionInvoicedEntity.tableName}.subscriptionInvoiceId`,
        },
      },
    };
  }
}
