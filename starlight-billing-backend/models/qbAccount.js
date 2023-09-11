import BaseModel from './_base.js';
import QBConfiguration from './qbConfiguration.js';

export default class QBAccount extends BaseModel {
  static get tableName() {
    return 'quick_books_accounts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['integrationId', 'quickBooksId', 'name'],
      properties: {
        integrationId: { type: 'integer' },
        quickBooksId: { type: 'string' },
        name: { type: 'string' },
        fullName: { type: 'string' },
        type: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      qbConfiguration: {
        relation: this.BelongsToOneRelation,
        modelClass: QBConfiguration,
        join: {
          from: `${this.tableName}.integrationId`,
          to: `${QBConfiguration.tableName}.id`,
        },
      },
    };
  }

  static async createOne({ data, fields = ['*'] } = {}) {
    // HACKY SOLUTION FOR INSERT IGNORE JGG
    const current = await this.query()
      .where({ name: data.name, integrationId: data.integrationId })
      .first();
    let result = [];
    if (!current) {
      result = await this.query().insert(data, fields);
    }
    return result;
  }

  static async getAll(integrationId) {
    const qbConfiguration = await QBConfiguration.getBy({
      condition: { id: integrationId },
      fields: [
        'accountReceivable',
        'defaultAccountIncome',
        'defaultAccountTax',
        'defaultPaymentAccount',
        'defaultAccountFinCharges',
        'writeoffAccount',
        'creditMemoAccount',
      ],
    });
    // eslint-disable-next-line max-statements-per-line
    const defaultAccountKeys = Object.keys(qbConfiguration).filter(element => {
      return element != 'tenant';
    });
    const accounts = [];
    defaultAccountKeys.forEach((accountKey, index) => {
      if (qbConfiguration[accountKey]) {
        accounts.push({
          id: index,
          quickBooksId: 'default-account',
          integrationId,
          name: qbConfiguration[accountKey],
          type: 'default-account',
        });
      }
    });
    const qbAccounts = await this.query()
      .where({ integrationId })
      .select(['*'])
      .orderBy(`${this.tableName}.id`, 'DESC');
    qbAccounts.forEach(account => {
      accounts.push({
        id: account.id,
        quickBooksId: account.quickBooksId,
        integrationId: account.integrationId,
        name: account.name,
        type: account.type,
      });
    });
    return accounts;
  }
}
