import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { logger } from '../utils/logger.js';

import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USER,
  DB_REMOTE_CORE_HOST,
  DB_REMOTE_CORE_NAME,
  DB_REMOTE_CORE_PASSWORD,
  DB_REMOTE_CORE_PORT,
  DB_REMOTE_CORE_USER,
  DB_REMOTE_PRICING_HOST,
  DB_REMOTE_PRICING_NAME, DB_REMOTE_PRICING_PASSWORD,
  DB_REMOTE_PRICING_PORT, DB_REMOTE_PRICING_USER,
} from '../config.js';
import { knexSnakeCaseMappers } from '../utils/columnNameMappers.js';

const currentPath = dirname(fileURLToPath(import.meta.url));

const commonKnexConfig = {
  client: 'postgresql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  pool: { min: 0, max: 20 },
  asyncStackTraces: true,
};

// The following settings are being used for the foreign data wrappers
const customKnexConfig = {
  remote: {
    core: {
      // TODO - remove core_
      host: DB_REMOTE_CORE_HOST,
      port: DB_REMOTE_CORE_PORT,
      database: DB_REMOTE_CORE_NAME,
      user: DB_REMOTE_CORE_USER,
      password: DB_REMOTE_CORE_PASSWORD,
    },
    pricing: {
      host: DB_REMOTE_PRICING_HOST,
      port: DB_REMOTE_PRICING_PORT,
      database: DB_REMOTE_PRICING_NAME,
      user: DB_REMOTE_PRICING_USER,
      password: DB_REMOTE_PRICING_PASSWORD,
    },
  }
};
const knexForModelsConfig = {
  ...commonKnexConfig,
  ...knexSnakeCaseMappers(),
};

const knexForMigrationsConfig = { ...commonKnexConfig, ...customKnexConfig };

const config = {
  logger,
  // config that will be passed to the underlying Knex instance
  knexForModelsConfig,
  knexForMigrationsConfig,
  // Directory with tenant and global migrations;
  // they will be stored in {migrationsDirectory}/global
  // and {migrationsDirectory}/tenant respectively
  migrationsDirectory: join(currentPath, './migrations/'),
  // Directory with migration and seed stubs
  stubsDirectory: join(currentPath, './dbManagerFramework/stubs'),
  // Schema where all migration and other administrative tables will be stored
  internalSchema: 'admin',
  // Table with global migrations
  migrationTable: 'migrations',
  // Table with tenant-scoped migrations
  tenantMigrationTable: 'tenant_migrations',
  // Table with list of all tenants
  tenantTable: 'tenants',
  seedsDirectory: join(currentPath, './seeds'),
};

export default config;
