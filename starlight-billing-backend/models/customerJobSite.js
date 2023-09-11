import BaseModel from './_base.js';

export default class CustomerJobSite extends BaseModel {
  static get tableName() {
    return 'customer_job_site';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['id', 'jobSiteId', 'customerId', 'sendInvoicesToJobSite'],

      properties: {
        id: { type: 'integer' },
        jobSiteId: { type: 'integer' },
        customerId: { type: 'integer' },
        sendInvoicesToJobSite: { type: 'boolean' },
        invoiceEmails: {
          type: ['array', null],
          default: [],
          items: {
            type: 'string',
            format: 'email',
          },
        },
      },
    };
  }

  static get relationMappings() {
    const { Customer, JobSite, Order } = this.models;
    return {
      jobSite: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: JobSite,
        join: {
          from: `${this.tableName}.jobSiteId`,
          to: `${JobSite.tableName}.id`,
        },
      },
      customer: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.customerId`,
          to: `${Customer.tableName}.id`,
        },
      },
      orders: {
        relation: BaseModel.HasManyRelation,
        modelClass: Order,
        join: {
          from: `${this.tableName}.id`,
          to: `${Order.tableName}.customerJobSiteId`,
        },
      },
    };
  }

  static async upsertOne(data) {
    const trx = await this.startTransaction();

    let customerJobSite;
    try {
      customerJobSite = await this.query(trx).upsertGraphAndFetch(data, {
        insertMissing: true,
        noDelete: true,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return customerJobSite;
  }
}
