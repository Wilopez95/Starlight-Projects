import R from 'ramda';

import logger from '../logger/index.js';
import { MIGRATION_COMMANDS } from '../../db/consts.js';
import knex from '../../db/connection.js';
import migrateSchemas from '../../db/migrateSchemas.js';
import { createCompany, getCompany, updateCompany } from '../../models/companies.js';
import { createTenant, removeTenant } from '../../models/tenants.js';

const { LATEST, ROLLBACK } = MIGRATION_COMMANDS;

export const createTenantSub = async data => {
  const { name } = data;
  let trx;
  try {
    trx = await knex.transaction();
    logger.info(`Creating tenant ${name}`);

    await createTenant(trx, data);

    await migrateSchemas({
      schema: name,
      command: LATEST,
      migrationName: null,
      migrate: true,
      seed: true,
      create: true,
      remove: false,
      all: false,
      test: false,
      transaction: trx,
    });

    logger.info(`Created tenant ${name}`);

    await trx.commit();
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }
    logger.error(error, 'Error creating tenant');
  }
};

export const removeTenantSub = async ({ name, id }) => {
  let trx;
  try {
    trx = await knex.transaction();
    logger.info(`Deleting tenant ${name}`);

    await removeTenant(trx, id);

    await migrateSchemas({
      schema: name,
      command: ROLLBACK,
      migrationName: null,
      migrate: true,
      seed: false,
      create: false,
      remove: true,
      all: true,
      test: false,
      transaction: trx,
    });

    logger.info(`Deleted tenant ${name}`);

    await trx.commit();
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }
    logger.error(error, 'Error deleting tenant');
  }
};

export const updateCompanySub = async data => {
  try {
    const { tenantId, legalName } = data;
    logger.info(`Updating company ${legalName}`);

    let company = await getCompany(tenantId);
    if (!company) {
      company = await createCompany(data);
    } else {
      company = await updateCompany(data);
    }

    logger.info(`Updated company ${R.toString(company)}`);
  } catch (error) {
    logger.error(error, 'Error updating company');
  }
};
