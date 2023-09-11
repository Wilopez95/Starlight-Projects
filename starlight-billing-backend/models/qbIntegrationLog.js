import BaseModel from './_base.js';
import QBConfiguration from './qbConfiguration.js';

export default class QBAccount extends BaseModel {
  static get tableName() {
    return 'quick_books_integration_log';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['configurationId', 'type'],

      properties: {
        configurationId: { type: 'integer' },
        description: { type: 'string' },
        type: { type: 'string' },
        lastSuccessfulIntegration: { type: ['string', null] },
        dateToAdjustment: { type: ['string', null] },
        rangeFrom: { type: ['string', null] },
        rangeTo: { type: ['string', null] },
        integrationBuList: {
          type: ['array', null],
          items: {
            type: 'integer',
          },
        },
        surchargesTotal: { type: ['number', null] },
        paymentsTotal: { type: ['number', null] },
        invoicesTotal: { type: ['number', null] },
        taxesTotal: { type: ['number', null] },
        adjustmentsTotal: { type: ['number', null] },
        finChargesTotal: { type: ['number', null] },
        creditMemosTotal: { type: ['number', null] },
        writeOffsTotal: { type: ['number', null] },
        tenantId: { type: ['integer', null] },
        statusCode: { type: ['integer', null] },
      },
    };
  }

  static get relationMappings() {
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

  static async createOne(
    { data: { lastSuccessfulIntegration, rangeFrom, rangeTo, ...data }, fields = [] } = {},
    trx,
  ) {
    const _trx = trx || (await this.startTransaction());
    try {
      const result = await this.query(_trx).insert(
        {
          lastSuccessfulIntegration: lastSuccessfulIntegration?.toUTCString(),
          rangeFrom: rangeFrom?.toUTCString(),
          rangeTo: rangeTo?.toUTCString(),
          ...data,
        },
        fields,
      );

      if (!trx) {
        await _trx.commit();
      }

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  static async getAll({
    condition: { lsiDateFrom, lsiDateTo, integrationBuList, type, ...condition },
    skip,
    limit,
    fields = ['*'],
  } = {}) {
    let query = this.query()
      .where(condition)
      .select(fields)
      .orderBy(`${this.tableName}.id`, 'DESC');
    if (limit) {
      query = query.limit(limit);
    }
    if (skip) {
      query = query.offset(skip);
    }
    if (lsiDateFrom) {
      query = query.andWhere(`${this.tableName}.lastSuccessfulIntegration`, '>', lsiDateFrom);
    }
    if (lsiDateTo) {
      query = query.andWhere(`${this.tableName}.lastSuccessfulIntegration`, '<=', lsiDateTo);
    }
    if (integrationBuList) {
      query = query.andWhere(`${this.tableName}.integrationBuList`, '@>', integrationBuList);
    }
    if (type) {
      query = query.whereIn(`${this.tableName}.type`, type);
    }

    const items = await query;
    return items;
  }
}
