import BaseModel from './_base.js';

export default class Subscription extends BaseModel {
  static get tableName() {
    return 'subscriptions';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['billingCycle', 'billingType', 'anniversaryBilling', 'startDate'],

      properties: {
        id: { type: 'integer' },
        billingCycle: { type: 'string' },
        billingType: { type: 'string' },
        anniversaryBilling: { type: 'boolean' },
        startDate: { type: 'date' },
      },
    };
  }

  static get relationMappings() {
    const { Invoice, JobSite, SubscriptionMedia } = this.models;

    return {
      invoice: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.id`,
          through: {
            from: 'subscriptionInvoice.subscriptionEntityId',
            to: 'subscriptionInvoice.invoiceId',
          },
          to: `${Invoice.tableName}.id`,
        },
      },
      jobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.jobSiteId`,
          to: `${JobSite.tableName}.id`,
        },
      },

      mediaFiles: {
        relation: BaseModel.HasManyRelation,
        modelClass: SubscriptionMedia,
        join: {
          from: `${this.tableName}.id`,
          to: `${SubscriptionMedia.tableName}.subscriptionId`,
        },
      },
    };
  }
}
