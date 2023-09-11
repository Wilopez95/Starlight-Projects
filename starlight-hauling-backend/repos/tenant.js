import isEmpty from 'lodash/isEmpty.js';

import config from '../db/config.js';
import knex from '../db/connection.js';
import dbManager from '../db/dbManagerFramework/dbManager.js';

import { generalErrorHandler } from '../errors/errorHandler.js';
import { REGION } from '../consts/regions.js';
import { DISTRICT_TYPE } from '../consts/districtTypes.js';
import BaseRepository from './_base.js';
import CompanyRepository from './company.js';
import DomainRepository from './domain.js';
import CompanyMailSettingsRepository from './companyMailSettings.js';
import TaxDistrictRepository from './taxDistrict.js';

const SCHEMA_NAME = 'admin';
const TABLE_NAME = 'tenants';

class TenantRepository extends BaseRepository {
  constructor(ctxState) {
    super(ctxState, { schemaName: SCHEMA_NAME, tableName: TABLE_NAME });
    this.upsertConstraints = ['name'];
  }

  async createOne({ data, fields = ['*'] } = {}) {
    const tenant = (
      await this.knex(this.tableName)
        .withSchema(this.schemaName)
        .insert(data, fields.concat(['id', 'name', 'region']))
    )?.[0];

    try {
      // This is necessary to apply the tenant migrations to the newly created tenant
      await dbManager.migrate.latest(this.knex, config);

      await this.postCreate(tenant);
    } catch (error) {
      try {
        await this.knex(this.tableName)
          .withSchema(this.schemaName)
          .where('name', data.name)
          .delete();
      } catch (err) {
        this.ctxState.logger.error(err, 'Failed to remove invalid tenant');
      }
      throw error;
    }

    return tenant;
  }

  async postCreate(tenant) {
    if (tenant.region === REGION.can) {
      await TaxDistrictRepository.getInstance(this.ctxState, {
        schemaName: tenant.name,
      }).createOne({
        data: {
          active: true,
          districtType: DISTRICT_TYPE.country,
          description: 'Goods and Services Tax',
        },
      });
    }
  }

  async deleteOne({ id, name }, trx) {
    const _trx = trx || (await knex.transaction());

    try {
      await DomainRepository.getInstance(this.ctxState).deleteBy(
        { condition: { tenantId: id } },
        _trx,
      );

      await CompanyMailSettingsRepository.getInstance(this.ctxState).deleteBy(
        { condition: { tenantId: id } },
        _trx,
      );
      await CompanyRepository.getInstance(this.ctxState).deleteBy(
        { condition: { tenantId: id } },
        _trx,
      );

      await _trx('contractors').withSchema(this.schemaName).where({ tenantId: id }).delete();

      await super.deleteBy({ condition: { name } }, _trx);

      await _trx.raw('drop schema if exists ?? cascade', name);

      // TODO add tenant-scoped rollbacks to migration framework
      await _trx(config.tenantMigrationTable)
        .withSchema(this.schemaName)
        .where({ tenant: name })
        .delete();

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getAllWithCompany() {
    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.id`,
        'name',
        'companyNameLine1 as companyName',
        'phone',
        'timeZoneName',
      ])
      .innerJoin(
        CompanyRepository.TABLE_NAME,
        `${CompanyRepository.TABLE_NAME}.tenantId`,
        `${TABLE_NAME}.id`,
      );
    return result;
  }
}

TenantRepository.TABLE_NAME = TABLE_NAME;
TenantRepository.SCHEMA_NAME = SCHEMA_NAME;

export const forEachTenant =
  (ctxState, action, withCompany = false) =>
  async () => {
    const tenantRepo = TenantRepository.getInstance(ctxState);

    const tenants = await (withCompany ? tenantRepo.getAllWithCompany() : tenantRepo.getAll());

    if (isEmpty(tenants)) {
      ctxState.logger.info(`None tenants or tenants' company info present`);
    } else {
      await Promise.all(tenants.map(({ name, ...company }) => action(name, company))).catch(
        generalErrorHandler,
      );
    }
  };

export default TenantRepository;
