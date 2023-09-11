import R from 'ramda';
import { utcToZonedTime, format } from 'date-fns-tz';

import knex from '../db/connection.js';
import {
  ADMIN_SCHEMA,
  COMPANIES_TABLE,
  COMPANY_CONFIGS_TABLE,
  TENANTS_TABLE,
} from '../db/consts.js';
import logger from '../services/logger/index.js';
import { searchAddress } from '../services/mapbox/index.js';
import { companyView } from '../views/company.js';
import { camelCaseKeys } from '../utils/functions.js';

export const mergeCompanyDataWithLatLong = async coData => {
  const [mapboxResult] = await searchAddress({
    query: `${coData.physicalAddressLine1}, ${coData.physicalCity}, ${coData.physicalState} ${coData.physicalZip}`,
    limit: 1,
  }).catch(err => logger.error(err));

  const mergedData = {
    ...coData,
    physicalLatitude: mapboxResult?.location?.lat,
    physicalLongitude: mapboxResult?.location?.lon,
  };
  return mergedData;
};

export const getCompany = async tenantId => {
  const result = await knex
    .withSchema(ADMIN_SCHEMA)
    .select('*')
    .from(COMPANIES_TABLE)
    .where({ tenantId })
    .first();
  return result;
};

export const getFullCompanyData = async companyId => {
  const result = await knex
    .withSchema(ADMIN_SCHEMA)
    .select([
      `${COMPANIES_TABLE}.*`,
      `${TENANTS_TABLE}.name`,
      `${TENANTS_TABLE}.legal_name`,
      `${COMPANY_CONFIGS_TABLE}.twilio_number`,
      `${COMPANY_CONFIGS_TABLE}.enable_signature`,
      `${COMPANY_CONFIGS_TABLE}.enable_manifest`,
      `${COMPANY_CONFIGS_TABLE}.enable_whip_around`,
      `${COMPANY_CONFIGS_TABLE}.enable_wingmate`,
    ])
    .from(COMPANIES_TABLE)
    .leftJoin(TENANTS_TABLE, `${TENANTS_TABLE}.id`, `${COMPANIES_TABLE}.tenant_id`)
    .leftJoin(COMPANY_CONFIGS_TABLE, `${COMPANY_CONFIGS_TABLE}.tenant_id`, `${TENANTS_TABLE}.id`)
    .where(`${COMPANIES_TABLE}.tenant_id`, companyId)
    .first();
  return result ? camelCaseKeys(result) : result;
};

export const getCompanies = async () => {
  const result = await knex.withSchema(ADMIN_SCHEMA).select('*').from(COMPANIES_TABLE);
  return result?.length ? result.map(camelCaseKeys) : [];
};

export const createCompany = async data => {
  const mergedData = await mergeCompanyDataWithLatLong(data);
  const result = await knex(COMPANIES_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .insert({
      ...R.omit(['id'], companyView(mergedData)),
    })
    .returning('*');
  return result;
};

export const updateCompany = async data => {
  const mergedData = await mergeCompanyDataWithLatLong(data);
  const result = await knex(COMPANIES_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .update({
      ...R.omit(['id'], companyView(mergedData)),
      modifiedDate: format(utcToZonedTime(new Date(), 'UTC'), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    })
    .where({ tenantId: data.tenantId })
    .returning('*');
  return result;
};

export const removeCompany = async tenantId => {
  const result = await knex(COMPANIES_TABLE)
    .withSchema(ADMIN_SCHEMA)
    .delete()
    .where({ tenantId })
    .returning('*');
  return result;
};
