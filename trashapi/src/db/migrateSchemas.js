/* eslint-disable no-shadow, no-unused-expressions */
import R from 'ramda';

import { getTenantsNames } from '../models/tenants.js';
import { SCHEMA_FOR_TEST } from '../config.js';
import migrateSchema from './migrateSchema.js';
import { checkCommand, checkFileName, debugMigrations, timeStart, timeEnd } from './helpers.js';
import knex from './connection.js';
import { IS_TEST_CI_DB_ENV, MIGRATIONS_TYPES } from './consts.js';

/**
 * @name migrateSchemas
 * @description Run migrations and seeds for concrete schema if param passed or for all tenants
 * @param {boolean} options.migrate - The flag to run migration.
 * @param {boolean} options.seed - The flag to run seeds.
 * @param {string} options.schema - The schema name.
 * @param {string} options.command - The migration command.
 * @param {string | null} options.migrationName - The migration file name if specified.
 * @param {string | null} options.seedName - The seed file name if specified.
 * @param {boolean} options.all - The flag for rollback command to rollback last batch or all.
 * @param {boolean} options.create - The flag to create schema if not exists.
 * @param {boolean} options.remove - The flag to remove schema if exists.
 * @param {boolean} options.test - The flag to run migrations on test schema from config.
 * @param {Object | null} options.transaction - The database transaction.
 */

// eslint-disable-next-line consistent-return
const migrateSchemas = async options => {
  const {
    migrate = true,
    seed = true,
    command,
    migrationName = null,
    seedName = null,
    all = false,
    transaction = null,
    create = false,
    remove = false,
    test = false,
  } = options;
  let { schema } = options;
  const oldName = schema;
  schema = test || IS_TEST_CI_DB_ENV ? SCHEMA_FOR_TEST : schema;

  if (!migrate && !seed) {
    return debugMigrations(`Migration skipped, please check migration options.`);
  }
  timeStart('Migrations executing time');
  debugMigrations(`Starting running migrateSchemas with args: ${R.toString(options)}.`);

  if (oldName !== schema) {
    debugMigrations(`Regarding input and env schema name "${oldName}" was changed to "${schema}".`);
  }

  checkCommand(command);
  const isSetMigration = await checkFileName(options, MIGRATIONS_TYPES.migration);
  const isSetSeed = await checkFileName(options, MIGRATIONS_TYPES.seed);

  let trx;
  let data;
  try {
    trx = transaction || (await knex.transaction());
    const schemasList = schema ? [schema] : (await getTenantsNames(trx)) || [];
    const count = schemasList.length;

    debugMigrations({
      schemasList,
      count,
    });

    if (!count) {
      if (!transaction) {
        await trx.rollback();
      }
      return debugMigrations('There are no schemas to run migrations.');
    }

    data = {
      migrate,
      seed,
      command,
      all,
      migrationName: isSetMigration ? migrationName : null,
      seedName: isSetSeed ? seedName : null,
      processed: 0,
      succeeded: 0,
      failed: 0,
      count,
      errors: [],
      transaction: trx,
    };

    for (const schema of schemasList) {
      if (create) {
        const created = await trx.raw(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
        created && debugMigrations(`Created schema ${schema}.`);
      }

      await migrateSchema(schema, data);

      if (remove) {
        const removed = await trx.raw(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        removed && debugMigrations(`Removed schema ${schema}.`);
      }
    }

    if (!transaction) {
      await trx.commit();
    }
  } catch (error) {
    if (trx && !transaction) {
      await trx.rollback();
    }
    throw error;
  }

  debugMigrations(`Finished running migrateSchemas with data: ${R.toString(data)}.`);
  timeEnd('Migrations executing time');
};

export default migrateSchemas;
