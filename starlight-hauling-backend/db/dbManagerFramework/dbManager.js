import { promises as fsPromises } from 'fs';
import { join } from 'path';

import { migrateUp, migrateDown } from './migrate.js';
import seed from './seed.js';

import lockTable from './helpers/lockTable.js';
import getLatestBatch from './helpers/getLatestBatch.js';
import ensureMigrationTables from './helpers/ensureMigrationTables.js';
import verifyConfig from './helpers/verifyConfig.js';
import getMigrationName from './helpers/getMigrationName.js';
import createDirIfNotExists from './helpers/createDirIfNotExists.js';
import getLatest from './helpers/getLatest.js';

const up = async (knex, config, count = 1) => {
  verifyConfig(config);

  await ensureMigrationTables(knex, config);

  let trx = null;
  try {
    trx = await knex.transaction();
    const locked = await lockTable(trx, config.internalSchema, config.migrationTable);

    if (!locked) {
      config.logger.info('Someone is already running migrations. Aborting...');
      await trx.rollback();

      return;
    }

    const latestBatch = await getLatestBatch(trx, config);
    const currentBatch = latestBatch + 1;

    await migrateUp(trx, config, currentBatch, count);

    // Reset the search_path in case anything relies on it

    await trx.raw('set search_path to public');
    await trx.commit();
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }

    // Re-create the connection pool to prevent issues with search_path
    await knex.destroy();
    await knex.initialize();

    throw error;
  }
};

const down = async (knex, config, count = 1) => {
  verifyConfig(config);

  await ensureMigrationTables(knex, config);

  let trx = null;

  try {
    trx = await knex.transaction();

    const locked = await lockTable(trx, config.internalSchema, config.migrationTable);

    if (!locked) {
      config.logger.info('Someone is already running migrations. Aborting...');
      await trx.rollback();

      return;
    }

    await migrateDown(trx, config, count);

    // Reset the search_path in case anything relies on it
    await trx.raw('set search_path to public');
    await trx.commit();
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }

    // Re-create the connection pool to prevent issues with search_path
    await knex.destroy();
    await knex.initialize();

    throw error;
  }
};

const createMigration = async (
  { migrationsDirectory, stubsDirectory, logger },
  { name, tenant = false } = {},
) => {
  const isDirAccessible = await createDirIfNotExists(
    migrationsDirectory,
    { logger },
    { writable: true },
  );

  if (!isDirAccessible) {
    return;
  }

  let filePath;

  if (tenant) {
    filePath = join(migrationsDirectory, 'tenant');
  } else {
    filePath = join(migrationsDirectory, 'global');
  }

  const isSubDirAccessible = await createDirIfNotExists(
    migrationsDirectory,
    { logger },
    { writable: true },
  );

  if (!isSubDirAccessible) {
    return;
  }

  const filename = join(filePath, getMigrationName(name));
  const stub = await fsPromises.readFile(join(stubsDirectory, './migration.js'));

  await fsPromises.writeFile(filename, stub);
};

const createSeed = async ({ seedsDirectory, stubsDirectory, logger }, { name } = {}) => {
  await createDirIfNotExists(seedsDirectory, { logger }, { writable: true });

  const filename = join(seedsDirectory, `${name}.js`);
  const stub = await fsPromises.readFile(join(stubsDirectory, './seed.js'));

  await fsPromises.writeFile(filename, stub);
};

const dbManager = {
  migrate: {
    up,
    down,
    latest: (knex, config) => up(knex, config, 0),
    rollback: (knex, config) => down(knex, config, 0),
    createMigration,
    getAllApplied: (knex, config) => getLatest(knex, config, 0),
  },
  seed: {
    run: seed,
    createSeed,
  },
};

export default dbManager;
