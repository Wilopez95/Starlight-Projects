import BaseModel from './_base.js';
import Tenant from './tenant.js';
import QBAccount from './qbAccount.js';

export default class QBConfiguration extends BaseModel {
  static get tableName() {
    return 'quick_books_configuration';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [
        'tenantId',
        'lastSuccessfulIntegration',
        'password',
        'dateToAdjustment',
        'description',
        'systemType',
        'integrationPeriod',
      ],
      properties: {
        id: { type: 'integer' },
        tenantId: { type: 'integer' },
        description: { type: 'string' },
        systemType: { type: 'string' },
        integrationPeriod: { type: 'date' },
        lastSuccessfulIntegration: { type: 'string' },
        dateToAdjustment: { type: 'integer' },
        password: { type: 'string' },
        accountReceivable: { type: ['string', null] },
        defaultAccountIncome: { type: ['string', null] },
        defaultAccountTax: { type: ['string', null] },
        defaultPaymentAccount: { type: ['string', null] },
        defaultAccountFinCharges: { type: ['string', null] },
        writeoffAccount: { type: ['string', null] },
        creditMemoAccount: { type: ['string', null] },
        integrationBuList: {
          type: ['array', null],
          items: {
            type: 'integer',
          },
        },
      },
    };
  }

  static get relationMappings() {
    return {
      tenant: {
        relation: this.BelongsToOneRelation,
        modelClass: Tenant,
        join: {
          from: `${this.tableName}.tenantId`,
          to: `${Tenant.tableName}.id`,
        },
      },
      accounts: {
        relation: this.HasManyRelation,
        modelClass: QBAccount,
        join: {
          from: `${this.tableName}.id`,
          to: `${QBAccount.tableName}.configurationId`,
        },
      },
    };
  }

  static async createOne({ data, fields = ['*'] } = {}) {
    const result = await this.query().insert(data, fields);
    return result;
  }

  // eslint-disable-next-line no-unused-vars
  static async getBy({ condition, fields = ['*'], joinAccounts = false } = {}) {
    const query = this.query().where(condition).select(fields).first().withGraphFetched('tenant');

    // if (joinAccounts) { // WILL INVESTIGATE THIS LATER JGG
    //   query = query.withGraphJoined('accounts');
    // }

    const item = await query;
    return item;
  }

  static async patchBy({ condition = {}, data, fields = ['*'] } = {}) {
    const result = await this.query().patch(data, fields).where(condition);

    return result ? result[0] : null;
  }

  static async deleteOne({ condition } = {}) {
    await this.query().where(condition).delete();
  }

  static async updateLastSuccessfulIntegration({ condition, data }) {
    await this.query().where(condition).patch(data);
  }
}
