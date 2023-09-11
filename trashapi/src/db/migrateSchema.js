/* eslint-disable no-unused-expressions */
import { updateLock } from '../models/lock.js';
import {
  logStartMessage,
  logResultMessage,
  logFinishMessage,
  logErrorMessage,
  getMigratingDirs,
  isPublicSchema,
} from './helpers.js';
import { MIGRATION_COMMANDS, ALLOWED_SEED_COMMANDS } from './consts.js';
import knex from './connection.js';

/**
 * @name migrateSchema
 * @description Run single schema migrations and seeds
 * @param {string} schema - The schema name.
 * @param data
 * @param {Object} data.transaction - The transaction object.
 * @param {string} data.command - The migration command.
 * @param {string | null} data.migrationName - The migration file name if specified.
 * @param {string | null} data.seedName - The seed file name if specified.
 * @param {number} data.processed - The count of processed schemas migration.
 * @param {number} data.succeeded - The count of succeeded schemas migration.
 * @param {number} data.failed - The count of failed schemas migration.
 * @param {number} data.count - The total count of schemas.
 * @param {boolean} data.migrate - The flag to run migration.
 * @param {boolean} data.seed - The flag to run seeds.
 * @param {boolean} data.all - The flag for rollback command to rollback last batch or all.
 * @param {Object[]} data.errors - The detailed error of failed schemas.
 */

const migrateSchema = async (schema, data) => {
  const { command, migrationName, seedName, migrate, seed, all, transaction } = data;
  let trx;
  logStartMessage(schema);

  try {
    trx = transaction || (await knex.transaction());

    const upperCommand = command.toUpperCase();
    const method = MIGRATION_COMMANDS[upperCommand];
    const isPublic = isPublicSchema(schema);
    const isUnlock = upperCommand === MIGRATION_COMMANDS.UNLOCK;
    const isRollback = upperCommand === MIGRATION_COMMANDS.ROLLBACK;
    const isUnlockPublicSchema = isPublic && isUnlock;
    const dirs = getMigratingDirs(schema);

    const migrationsConfig = {
      disableTransactions: true,
      directory: dirs.migrations,
      schemaName: schema,
      loadExtensions: ['.js', '.mjs', '.cjs'],
    };
    migrationName && (migrationsConfig.name = migrationName);
    const migrationParams = [migrationsConfig];
    isRollback && migrationParams.push(all);

    const seedConfig = {
      directory: dirs.seeds,
      loadExtensions: ['.js', '.mjs', '.cjs'],
    };
    seedName && (seedConfig.specific = seedName);

    await trx.raw(`SET search_path TO "${schema}"`);

    if (isUnlockPublicSchema) {
      await updateLock(false);
    }
    const migrations = migrate ? await trx.migrate[method](...migrationParams) : 'Not executed.';
    const seeds =
      seed && ALLOWED_SEED_COMMANDS.includes(method)
        ? await trx.seed.run(seedConfig)
        : 'Not executed.';

    logResultMessage(schema, migrations, seeds);
    data.succeeded++;
    if (!transaction) {
      await trx.commit();
    }
  } catch (err) {
    data.failed++;
    data.errors.push(err);
    logErrorMessage(schema, err);
    if (trx && !transaction) {
      await trx.rollback();
    }
    throw err;
  } finally {
    data.processed++;
    logFinishMessage(schema, data);
  }
};

export default migrateSchema;
