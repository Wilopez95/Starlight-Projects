import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import { mapAddressFields } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';
import TenantRepository from './tenant.js';
import CompanyMailSettingsRepository from './companyMailSettings.js';
import DomainRepository from './domain.js';

const SCHEMA_NAME = 'admin';
const TABLE_NAME = 'companies';

class CompanyRepository extends BaseRepository {
  constructor(ctxState) {
    super(ctxState, { schemaName: SCHEMA_NAME, tableName: TABLE_NAME });

    this.upsertConstraints = ['tenantId'];
  }

  mapFields(originalObj) {
    return compose(mapAddressFields, super.camelCaseKeys, super.mapFields)(originalObj);
  }

  async upsert({ data, constraints, concurrentData, log } = {}, trx) {
    const { tenantId } = data;
    let result;

    const _trx = trx || (await this.knex.transaction());

    try {
      const exists = await super.getBy({ condition: { tenantId }, fields: ['id'] }, _trx);

      result = await super.upsert({ data, constraints, concurrentData }, _trx);

      if (!trx) {
        await _trx.commit();

        log &&
          this.log({
            id: tenantId,
            action: exists ? this.logAction.modify : this.logAction.create,
            entity: this.logEntity.companies,
          });
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return result ? this.mapFields(result) : null;
  }

  async getBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    const result = await super.getBy({ condition, fields }, trx);

    return isEmpty(result) ? null : this.mapFields(result);
  }

  async updateBy({ data, condition, fields = ['*'], concurrentData, log }) {
    const result = await super.updateBy({
      condition,
      concurrentData,
      data,
      fields,
    });

    log &&
      this.log({
        id: condition?.tenantId ?? data.tenantId,
        action: this.logAction.modify,
        entity: this.logEntity.companies,
      });

    return result ? this.mapFields(result) : null;
  }

  getWithTenant({ condition: { tenantName, ...condition }, fields = ['*'] } = {}, trx = this.knex) {
    if (tenantName) {
      condition[`${TenantRepository.TABLE_NAME}.name`] = tenantName;
    }

    return super
      .getBy(
        {
          condition,
          fields: fields.concat(
            this.knex.raw('to_json(??.*) as ??', [TenantRepository.TABLE_NAME, 'tenant']),
          ),
        },
        trx,
      )
      .innerJoin(
        `${TenantRepository.TABLE_NAME}`,
        `${this.tableName}.tenantId`,
        `${TenantRepository.TABLE_NAME}.id`,
      )
      .groupBy(`${this.tableName}.id`, `${TenantRepository.TABLE_NAME}.id`);
  }

  async getByIdToLog(tenantId, trx = this.knex) {
    const fields = [
      `${this.tableName}.*`,
      trx.raw('to_json(??.*) as ??', [TenantRepository.TABLE_NAME, 'tenant']),
      trx.raw('to_json(??.*) as ??', [CompanyMailSettingsRepository.TABLE_NAME, 'mailSettings']),
      trx.raw('json_agg(??.*) as ??', [DomainRepository.TABLE_NAME, 'domains']),
    ];

    const item = await super
      .getBy(
        {
          condition: { [`${this.tableName}.tenantId`]: tenantId },
          fields,
        },
        trx,
      )
      .innerJoin(
        `${TenantRepository.TABLE_NAME}`,
        `${this.tableName}.tenantId`,
        `${TenantRepository.TABLE_NAME}.id`,
      )
      .leftJoin(
        `${CompanyMailSettingsRepository.TABLE_NAME}`,
        `${CompanyMailSettingsRepository.TABLE_NAME}.tenantId`,
        `${this.tableName}.tenantId`,
      )
      .leftJoin(
        `${DomainRepository.TABLE_NAME}`,
        `${DomainRepository.TABLE_NAME}.tenantId`,
        `${this.tableName}.tenantId`,
      )
      .groupBy([
        `${this.tableName}.id`,
        `${TenantRepository.TABLE_NAME}.id`,
        `${CompanyMailSettingsRepository.TABLE_NAME}.id`,
        `${DomainRepository.TABLE_NAME}.id`,
      ]);

    return item
      ? compose(super.mapNestedObjects.bind(this, []), this.mapFields.bind(this))(item)
      : null;
  }
}

CompanyRepository.TABLE_NAME = TABLE_NAME;
CompanyRepository.SCHEMA_NAME = SCHEMA_NAME;

export default CompanyRepository;
