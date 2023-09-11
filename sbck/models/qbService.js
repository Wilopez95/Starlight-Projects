import BaseModel from './_base.js';

export default class QBService extends BaseModel {
  static get tableName() {
    return 'quick_books_services';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['configurationId', 'type'],
      properties: {
        configurationId: { type: 'integer' },
        billableLineItemId: { type: 'integer' },
        description: { type: 'string' },
        type: { type: 'string' },
        customerGroup: { type: 'string' },
        customerGroupId: { type: 'number' },
        accountName: { type: 'string' },
        districtType: { type: 'string' },
        lineOfBussinessId: { type: 'number' },
        subscriptionBillingCycle: { type: 'number' },
        materialId: { type: 'number' },
        equipmentId: { type: 'number' },
        districtId: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    const { QBConfiguration } = this.models;
    return {
      qbConfiguration: {
        relation: this.BelongsToOneRelation,
        modelClass: QBConfiguration,
        join: {
          from: `${this.tableName}.configurationId`,
          to: `${QBConfiguration.tableName}.id`,
        },
      },
    };
  }

  static async insertMany(
    { configurationId, data, fields = ['*'], billableItemType },
    outerTransaction,
  ) {
    const trx = await this.startTransaction();
    let result = [];
    try {
      const query = this.query().where({ configurationId });
      if (billableItemType) {
        if (Array.isArray(billableItemType)) {
          billableItemType.forEach((type, index) => {
            if (index) {
              query.orWhere({ type });
            } else {
              query.andWhere({ type });
            }
          });
        } else {
          query.andWhere({ type: billableItemType });
        }
      }
      await query.delete();
      const accounts = data.map(el => ({ ...el, configurationId: parseInt(configurationId, 10) }));
      if (accounts.length) {
        result = await this.query().insert(accounts, fields);
      }
      if (!outerTransaction) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTransaction) {
        await trx.rollback();
      }
      throw error;
    }
    return result;
  }
}
