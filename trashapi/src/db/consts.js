import appRoot from 'app-root-path';
import { NODE_ENV } from '../config.js';

const PUBLIC_MIGRATIONS_DIR = `${appRoot}/src/db/migrations/public`;
const PUBLIC_SEEDS_DIR = `${appRoot}/src/db/seeds/public`;

const ADMIN_MIGRATIONS_DIR = `${appRoot}/src/db/migrations/admin`;
const ADMIN_SEEDS_DIR = `${appRoot}/src/db/seeds/admin`;

const TENANT_MIGRATIONS_DIR = `${appRoot}/src/db/migrations/tenant`;
const TENANT_SEEDS_DIR = `${appRoot}/src/db/seeds/tenant`;

const ADMIN_SCHEMA = 'admin';
const PUBLIC_SCHEMA = 'public';

const TENANTS_TABLE = 'tenants';
const COMPANIES_TABLE = 'companies';
const COMPANY_CONFIGS_TABLE = 'company_configs';
const APP_MIGRATIONS_LOCK = 'app_migrations_lock';

const MIGRATION_COMMANDS = {
  LATEST: 'latest',
  UP: 'up',
  DOWN: 'down',
  ROLLBACK: 'rollback',
  UNLOCK: 'forceFreeMigrationsLock',
};
const ENVS = {
  DEV: 'dev',
  STAGING: 'staging',
  PRODUCTION: 'production',
  UAT: 'uat',
  DEVELOPMENT: 'development',
  TEST: 'test',
  CI: 'ci',
  DEV1_CORE: 'dev1-core',
  STAGING_CORE: 'staging_core',
  DEV2: 'dev2',
};
const MIGRATIONS_TYPES = {
  migration: 'migration',
  seed: 'seed',
};
const MIGRATIONS_TYPES_KEYS = Object.keys(MIGRATIONS_TYPES);

const { UP, DOWN, LATEST } = MIGRATION_COMMANDS;
const MIGRATION_FILE_COMMANDS = [UP, DOWN];
const ALLOWED_COMMANDS = Object.keys(MIGRATION_COMMANDS).map(item => item.toLowerCase());
const ALLOWED_SEED_COMMANDS = [UP, LATEST];

const { TEST, CI } = ENVS;
const IS_TEST_CI_DB_ENV = [TEST, CI].includes(NODE_ENV);

export {
  ADMIN_SCHEMA,
  PUBLIC_SCHEMA,
  TENANTS_TABLE,
  COMPANIES_TABLE,
  COMPANY_CONFIGS_TABLE,
  APP_MIGRATIONS_LOCK,
  MIGRATIONS_TYPES,
  MIGRATIONS_TYPES_KEYS,
  ADMIN_MIGRATIONS_DIR,
  TENANT_MIGRATIONS_DIR,
  PUBLIC_MIGRATIONS_DIR,
  ADMIN_SEEDS_DIR,
  TENANT_SEEDS_DIR,
  PUBLIC_SEEDS_DIR,
  MIGRATION_COMMANDS,
  ENVS,
  MIGRATION_FILE_COMMANDS,
  ALLOWED_COMMANDS,
  ALLOWED_SEED_COMMANDS,
  IS_TEST_CI_DB_ENV,
};
