// eslint-disable-next-line import/default
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import dateFnsTz from 'date-fns-tz';
import pg from 'pg';
import dotenv from 'dotenv';
import mapKeys from 'lodash/fp/mapKeys.js';
import snakeCase from 'lodash/fp/snakeCase.js';
import camelCase from 'lodash/fp/camelCase.js';
import isEmpty from 'lodash/fp/isEmpty.js';

import { logger } from '../utils/logger.js';

const { zonedTimeToUtc } = dateFnsTz;
const currentPath = dirname(fileURLToPath(import.meta.url));

let { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME || !DB_PORT) {
  dotenv.config({
    path: join(currentPath, '../.env'),
  });

  ({ DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env);
}

// according to https://github.com/knex/knex/issues/2094 and
// https://github.com/brianc/node-postgres/issues/1071
const dateTimeParser = stringValue => zonedTimeToUtc(stringValue, 'UTC');

pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.DATE, dateTimeParser);
pg.types.setTypeParser(pg.types.builtins.INT8, Number); // INT8 means BIGINT
pg.types.setTypeParser(pg.types.builtins.NUMERIC, Number);

const knexConfig = {
  wrapIdentifier: (value, originalImpl) => originalImpl(value === '*' ? value : snakeCase(value)),
  postProcessResponse: response => {
    const result = Array.isArray(response)
      ? response.map(mapKeys(camelCase))
      : mapKeys(camelCase)(response);

    return isEmpty(result) ? null : result;
  },
  client: 'postgresql',
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    timezone: 'UTC',
  },
  pool: { min: 0, max: 30 },
  asyncStackTraces: true,
};

const config = {
  logger,
  // config that will be passed to the underlying Knex instance
  knexConfig,
  // Directory with tenant and global migrations;
  // they will be stored in {migrationsDirectory}/global
  // and {migrationsDirectory}/tenant respectively
  migrationsDirectory: join(currentPath, './migrations/'),
  // Directory with migration and seed stubs
  stubsDirectory: join(currentPath, './dbManagerFramework/stubs'),
  // Schema where all migration and other administrative tables will be stored
  internalSchema: 'admin',
  publicSchema: 'public',
  // Table with global migrations
  migrationTable: 'migrations',
  // Table with tenant-scoped migrations
  tenantMigrationTable: 'tenant_migrations',
  // Table with list of all tenants
  tenantTable: 'tenants',
  seedsDirectory: join(currentPath, './seeds'),
};

export default config;
