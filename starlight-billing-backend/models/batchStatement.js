import { DEFAULT_LIMIT } from '../consts/defaults.js';
import { BatchStatementSorting } from '../consts/batchStatementSorting.js';
import { SortOrder } from '../consts/sortOrders.js';
import BaseModel from './_base.js';

export default class BatchStatement extends BaseModel {
  static get tableName() {
    return 'batch_statements';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['businessUnitId', 'statementDate', 'endDate', 'count', 'total'],

      properties: {
        id: { type: 'integer' },
        businessUnitId: { type: 'integer' },

        statementDate: { type: 'string' },
        endDate: { type: 'string' },

        count: { type: 'number' },
        total: { type: 'number' },
      },
    };
  }

  static get relationMappings() {
    const { BusinessUnit, Statement } = this.models;
    return {
      businessUnit: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.businessUnitId`,
          to: `${BusinessUnit.tableName}.id`,
        },
      },
      statements: {
        relation: BaseModel.HasManyRelation,
        modelClass: Statement,
        join: {
          from: `${this.tableName}.id`,
          to: `${Statement.tableName}.batchStatementId`,
        },
      },
    };
  }

  static async createOne({ data }) {
    const batchStatement = await this.query().insertGraph(data, { relate: true });

    return batchStatement;
  }

  static async getAllPaginated({
    condition: { businessUnitId },
    limit = DEFAULT_LIMIT,
    offset = 0,
    sortBy = BatchStatementSorting.ID,
    sortOrder = SortOrder.DESC,
  }) {
    const items = await this.query()
      .limit(limit)
      .offset(offset)
      .where({ businessUnitId })
      .orderBy(sortBy, sortOrder);

    return items;
  }

  static async getStatementsByIds(ids) {
    const items = await this.relatedQuery('statements').for(ids).select('id');

    return items;
  }

  static async getByIdToLog({ id, schemaName, fields = ['*'] }, trx) {
    const item = await super
      .getByIdToLog({ id, schemaName, fields }, trx)
      .withGraphFetched('[businessUnit,statements]');

    return item ? super.castNumbers(item) : null;
  }
}
