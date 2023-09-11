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
    const databaseConfig = dbConfig;
    this.knex = Knex(databaseConfig);
  }

  async migrateUp(dbConfig, count = 1) {
    const databaseConfig = dbConfig;
    verifyConfig(databaseConfig);

    await ensureMigrationTables(this.knex, databaseConfig);

    const trx = await this.knex.transaction();

    try {
      const locked = await lockTable(
        trx,
        databaseConfig.internalSchema,
        databaseConfig.migrationTable,
      );

      if (!locked) {
        databaseConfig.logger.info('Someone is already running migrations. Aborting...');
        await trx.rollback();

        return;
      }

      const latestBatch = await getLatestBatch(trx, databaseConfig);
      const currentBatch = latestBatch + 1;

      await migrateUp(trx, databaseConfig, currentBatch, count);

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
    const databaseConfig = dbConfig;
    verifyConfig(databaseConfig);

    await ensureMigrationTables(this.knex, databaseConfig);

    const trx = await this.knex.transaction();

    try {
      const locked = await lockTable(
        trx,
        databaseConfig.internalSchema,
        databaseConfig.migrationTable,
      );

      if (!locked) {
        databaseConfig.logger.info('Someone is already running migrations. Aborting...');
        await trx.rollback();

        return;
      }

      await migrateDown(trx, databaseConfig, count);

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
    const databaseConfig = dbConfig;

    await this.migrateUp(databaseConfig, 0);
  }

  async rollbackAll(dbConfig) {
    const databaseConfig = dbConfig;
    await this.migrateDown(databaseConfig, 0);
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
    const databaseConfig = dbConfig;
    await seed(this.knex, databaseConfig);
  }

  async getAllApplied(dbConfig) {
    const databaseConfig = dbConfig;
    const result = await getLatest(this.knex, databaseConfig, 0);
    return result;
  }
}

const dbManager = new DatabaseManager(config.knexForMigrationsConfig);

export default dbManager;
