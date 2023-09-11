import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import dateFnsTz from 'date-fns-tz';
import pg from 'pg';

import { logger } from '../utils/logger.js';
import { knexSnakeCaseMappers } from '../utils/columnNameMappers.js';

import { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } from '../config.js';

const currentPath = dirname(fileURLToPath(import.meta.url));

const dateTimeParser = stringValue => dateFnsTz.zonedTimeToUtc(stringValue, 'UTC');

pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.DATE, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number);

const commonKnexConfig = {
  client: 'postgresql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    timezone: 'UTC',
  },
  pool: { min: 0, max: 20 },
  asyncStackTraces: true,
};

const knexForModelsConfig = {
  ...commonKnexConfig,
  ...knexSnakeCaseMappers(),
};

const knexForMigrationsConfig = { ...commonKnexConfig };

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
