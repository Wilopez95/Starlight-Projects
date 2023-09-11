import BaseModel from './_base.js';

export default class BusinessUnit extends BaseModel {
  static get tableName() {
    return 'business_units';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['id'],

      properties: {
        id: { type: 'integer' },
        active: { type: 'boolean' },
        nameLine1: { type: 'string' },
        type: { type: 'string' },
        timeZoneName: { type: ['string', null] },
        merchantId: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
    const { Customer, Merchant } = this.models;
    return {
      customer: {
        relation: BaseModel.HasOneRelation,
        modelClass: Customer,
        join: {
          from: `${this.tableName}.id`,
          to: `${Customer.tableName}.businessUnitId`,
        },
      },
      merchant: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Merchant,
        join: {
          from: `${this.tableName}.merchantId`,
          to: `${Merchant.tableName}.id`,
        },
      },
    };
  }

  static async upsertOne({ data: { merchant, ...data } } = {}) {
    const trx = await this.startTransaction();

    let businessUnit;
    try {
      businessUnit = await this.query(trx).upsertGraphAndFetch(
        {
          ...data,
          merchant,
        },
        { insertMissing: true, relate: ['customer', 'merchant'], noDelete: true },
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return businessUnit;
  }

  static async getWithMerchant({ condition: { businessUnitId } } = {}, trx) {
    const result = await this.query(trx).findById(businessUnitId).withGraphFetched('merchant');

    return result;
  }

  static async getByCustomerId(customerId, fields = ['*'], trx) {
    const { Customer } = this.models;
    const item = await Customer.relatedQuery('businessUnit', trx)
      .for(customerId)
      .select(fields)
      .first();

    return item;
  }

  static async getTimeZone(id, trx) {
    const { Company } = this.models;
    const [bu, company] = await Promise.all([
      this.query(trx).where({ id }).select(['timeZoneName']).first(),
      Company.getByTenantName(this.schemaName, trx),
    ]);
    return { timeZone: bu.timeZoneName ?? company.timeZoneName };
  }
}
