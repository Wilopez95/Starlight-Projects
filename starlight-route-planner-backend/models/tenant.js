import snakeCase from 'lodash/snakeCase.js';

import knex, { dbManager } from '../db/connection.js';

import dbConfig from '../db/dbConfig.js';
import { logger } from '../utils/logger.js';
import { TABLES } from '../consts/tables.js';
import BaseModel from './_base.js';

export default class Tenant extends BaseModel {
  static get tableName() {
    return TABLES.TENANTS;
  }

  static get schemaName() {
    return dbConfig.internalSchema;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'legalName'],

      properties: {
        name: { type: 'string' },
        legalName: { type: 'string' },
      },
    };
  }

  async $afterInsert(context) {
    try {
      await dbManager.applyLatest(dbConfig);
    } catch (error) {
      try {
        await this.$query(context.transaction).deleteById(this.id);
      } catch (err) {
        logger.error(err, `Failed to delete invalid tenant ${this.id}`);
      }
      throw error;
    }
  }

  async $afterDelete(context) {
    const trx = context.transaction;

    await knex(dbConfig.tenantMigrationTable)
      .withSchema(this.schemaName)
      .delete()
      .where('tenant', this.name)
      .transacting(trx);

    await knex.raw('drop schema if exists ?? cascade', this.name).transacting(trx);
  }

  static async createOne({ data, fields = ['*'] } = {}) {
    data.name = snakeCase(data.name);

    await Tenant.query().insert(data, fields);
  }

  static async getAll({ fields = ['*'] } = {}) {
    const items = await Tenant.query().select(fields).orderBy('name');
    return items;
  }

  static async deleteOne({ condition } = {}) {
    await Tenant.query().where(condition).delete();
  }
}
