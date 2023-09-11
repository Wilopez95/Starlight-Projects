import { promises as fsPromises } from 'fs';
import { join } from 'path';

import Knex from 'knex';

import config from '../dbConfig.js';
import { migrateUp, migrateDown } from './migrate.js';
import seed from './seed.js';

import lockTable from './helpers/lockTable.js';
import getLatestBatch from './helpers/getLatestBatch.js';
import ensureMigrationTables from './helpers/ensureMigrationTables.js';
import verifyConfig from './helpers/verifyConfig.js';
import getMigrationName from './helpers/getMigrationName.js';
import createDirIfNotExists from './helpers/createDirIfNotExists.js';
import getLatest from './helpers/getLatest.js';

class DatabaseManager {
  constructor(dbConfig) {
    this.knex = Knex(dbConfig);
  }

  async migrateUp(dbConfig, count = 1) {
    verifyConfig(dbConfig);

    await ensureMigrationTables(this.knex, dbConfig);

    const trx = await this.knex.transaction();

    try {
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
      await trx.rollback();

      // Re-create the connection pool to prevent issues with search_path
      await this.knex.destroy();
      await this.knex.initialize();

      throw error;
    }
  }

  async migrateDown(dbConfig, count = 1) {
    verifyConfig(dbConfig);

    await ensureMigrationTables(this.knex, dbConfig);

    const trx = await this.knex.transaction();

    try {
      const locked = await lockTable(trx, dbConfig.internalSchema, dbConfig.migrationTable);

      if (!locked) {
        dbConfig.logger.info('Someone is already running migrations. Aborting...');
        await trx.rollback();

        return;
      }

      await migrateDown(trx, config, count);

      // Reset the search_path in case anything relies on it
      await trx.raw('set search_path to public');
      await trx.commit();
    } catch (error) {
      await trx.rollback();

      // Re-create the connection pool to prevent issues with search_path
      await this.knex.destroy();
      await this.knex.initialize();

      throw error;
    }
  }

  async applyLatest(dbConfig) {
    await this.migrateUp(dbConfig, 0);
  }

  async rollbackAll(dbConfig) {
    await this.migrateDown(dbConfig, 0);
  }

  async createMigration(
    { migrationsDirectory, stubsDirectory, logger },
    { name, tenant = false } = {},
  ) {
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
  }

  async createSeed({ seedsDirectory, stubsDirectory, logger }, { name } = {}) {
    await createDirIfNotExists(seedsDirectory, { logger }, { writable: true });

    const filename = join(seedsDirectory, `${name}.js`);
    const stub = await fsPromises.readFile(join(stubsDirectory, './seed.js'));

    await fsPromises.writeFile(filename, stub);
  }

  async runSeeds(dbConfig) {
    await seed(this.knex, dbConfig);
  }

  async getAllApplied(dbConfig) {
    const result = await getLatest(this.knex, dbConfig, 0);
    return result;
  }
}

const dbManager = new DatabaseManager(config.knexForMigrationsConfig);

export default dbManager;
