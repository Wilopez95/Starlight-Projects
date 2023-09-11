import snakeCase from 'lodash/snakeCase.js';

import { dbManager } from '../db/connection.js';

import { REGIONS } from '../consts/regions.js';

import dbConfig from '../db/dbConfig.js';
import { logger } from '../utils/logger.js';
import BaseModel from './_base.js';

export default class Tenant extends BaseModel {
  static get tableName() {
    return 'tenants';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'legalName', 'region'],

      properties: {
        name: { type: 'string' },
        legalName: { type: 'string' },
        region: { enum: REGIONS },
      },
    };
  }

  static get relationMappings() {
    const { Company } = this.models;
    return {
      company: {
        relation: this.BelongsToOneRelation,
        modelClass: Company,
        join: {
          from: `${this.tableName}.id`,
          to: `${Company.tableName}.tenantId`,
        },
      },
    };
  }

  static async createOne({ data, fields = ['*'] } = {}) {
    data.name = snakeCase(data.name);

    const newTenant = await this.query().insert(data, fields.concat('id'));

    try {
      await dbManager.applyLatest(dbConfig);
    } catch (error) {
      try {
        await this.deleteById(newTenant.id);
      } catch (err) {
        logger.error(err, `Failed to delete invalid tenant ${newTenant.id}`);
      }
      throw error;
    }
  }

  static async getAll({ fields = ['*'] } = {}) {
    const items = await this.query().select(fields).orderBy('name');
    return items;
  }

  static async getAllWithCompany() {
    const items = await this.query().withGraphFetched('company').orderBy('name');
    return items;
  }

  static async deleteOne({ condition: { name } = {} } = {}) {
    const trx = await this.startTransaction();

    try {
      await this.query(trx).where({ name }).delete();

      await this.query(trx)
        .from(dbConfig.tenantMigrationTable)
        .withSchema(this.schemaName)
        .where('tenant', name)
        .delete();

      await trx.raw('drop schema if exists ?? cascade', name);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
