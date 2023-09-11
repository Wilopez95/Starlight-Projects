import { SKIP_MIGRATION, MIGRATIONS_TIMEOUT } from '../config.js';
import logger from '../services/logger/index.js';
import { getLock, updateLock } from '../models/lock.js';
import migrateSchemas from './migrateSchemas.js';
import { MIGRATION_COMMANDS } from './consts.js';
import knex from './connection.js';

const { LATEST } = MIGRATION_COMMANDS;

const getOptions = (schema, transaction) => ({
  migrate: true,
  seed: true,
  command: LATEST.toLowerCase(),
  schema,
  create: true,
  remove: false,
  test: false,
  transaction,
});

const migrateDatabase = async () => {
  if (SKIP_MIGRATION) {
    return logger.info('DB: migrations setup is skipped.');
  }
  logger.info('DB: starting migration.');
  let trx;
  let isLocked = false;

  try {
    await migrateSchemas(getOptions('public', null));

    const migrationLocked = await getLock();
    if (migrationLocked) {
      return logger.info(`
        DB: skipped migrations because they are already running,
        if not, please unlock it manually with "yarn migrate:unlock [schema]".
      `);
    }

    // lock migrations
    isLocked = await updateLock(true);

    trx = await knex.transaction();

    await migrateSchemas(getOptions('admin', trx));
    await migrateSchemas(getOptions('tenant', trx));
    await migrateSchemas(getOptions(null, trx));

    await trx.commit();
    return logger.info('DB: migration finished.');
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }
    if (isLocked) {
      // unlock in case of fail
      isLocked = await updateLock(false);
    }
    throw error;
  } finally {
    // unlock migrations
    if (isLocked) {
      setTimeout(() => updateLock(false), MIGRATIONS_TIMEOUT);
    }
  }
};

export default migrateDatabase;
