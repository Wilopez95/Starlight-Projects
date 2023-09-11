import { utcToZonedTime, format } from 'date-fns-tz';
import knex from '../db/connection.js';
import { ADMIN_SCHEMA, COMPANY_CONFIGS_TABLE, TENANTS_TABLE } from '../db/consts.js';
import tenantsView from '../views/tenant.js';
import { camelCaseKeys } from '../utils/functions.js';
import { NotFoundError } from '../services/error/index.js';

export const getTenantsNames = async trx => {
  const result = await trx.withSchema(ADMIN_SCHEMA).select('name').from(TENANTS_TABLE);
  return result?.map(({ name }) => name) || [];
};

export const getTenant = async id => {
  const result = await knex
    .withSchema(ADMIN_SCHEMA)
    .select('*')
    .from(TENANTS_TABLE)
    .where({ id })
    .first();
  return result;
};

/**
 * @param {number} id - The tenant id
 * @returns a tenant with its config
 */
export const getTenantWithConfig = async id => {
  const result = await knex
    .withSchema(ADMIN_SCHEMA)
    .select([
      `${TENANTS_TABLE}.id`,
      `${TENANTS_TABLE}.name`,
      `${TENANTS_TABLE}.legal_name`,
      `${COMPANY_CONFIGS_TABLE}.twilio_number`,
      `${COMPANY_CONFIGS_TABLE}.enable_manifest`,
    ])
    .from(TENANTS_TABLE)
    .leftJoin(COMPANY_CONFIGS_TABLE, `${COMPANY_CONFIGS_TABLE}.tenant_id`, `${TENANTS_TABLE}.id`)
    .where(`${TENANTS_TABLE}.id`, id)
    .first();

  if (!result) {
    throw new NotFoundError(`Tenant with id ${id} does not exists`);
  }

  return camelCaseKeys(result);
};

export const getTenants = async () => {
  const result = await knex.withSchema(ADMIN_SCHEMA).select('*').from(TENANTS_TABLE);
  return result?.length ? result.map(camelCaseKeys) : [];
};

export const createTenant = async (trx, data) => {
  const result = await trx(TENANTS_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .insert(tenantsView(data))
    .returning('*');
  return result;
};

export const updateTenant = async ({ id, ...rest }) => {
  const result = await knex(TENANTS_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .update({
      ...tenantsView(rest),
      modifiedDate: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    })
    .where({ id })
    .returning('*');
  return result;
};

export const removeTenant = async (trx, id) => {
  const result = await trx(TENANTS_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .delete()
    .where({ id })
    .returning('*');
  return result;
};
