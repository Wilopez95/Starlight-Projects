import fs from 'fs/promises';
import R from 'ramda';
import debug from 'debug';

import logger from '../services/logger/index.js';
import { DEBUG } from '../config.js';
import {
  MIGRATION_FILE_COMMANDS,
  ALLOWED_COMMANDS,
  MIGRATIONS_TYPES,
  MIGRATIONS_TYPES_KEYS,
  ADMIN_SCHEMA,
  ADMIN_SEEDS_DIR,
  ADMIN_MIGRATIONS_DIR,
  PUBLIC_SCHEMA,
  PUBLIC_SEEDS_DIR,
  PUBLIC_MIGRATIONS_DIR,
  TENANT_SEEDS_DIR,
  TENANT_MIGRATIONS_DIR,
} from './consts.js';

const debugMigrations = debug('api:migrations');

const getMigratingDirs = type => {
  switch (type) {
    case ADMIN_SCHEMA:
      return {
        seeds: ADMIN_SEEDS_DIR,
        migrations: ADMIN_MIGRATIONS_DIR,
      };

    case PUBLIC_SCHEMA:
      return {
        seeds: PUBLIC_SEEDS_DIR,
        migrations: PUBLIC_MIGRATIONS_DIR,
      };

    default:
      return {
        seeds: TENANT_SEEDS_DIR,
        migrations: TENANT_MIGRATIONS_DIR,
      };
  }
};

const checkCommand = command => {
  if (ALLOWED_COMMANDS.includes(command)) {
    return;
  }

  const list = ALLOWED_COMMANDS.map(item => `"${item}"`).join(', ');
  throw new Error(`
    First process argument "command" value "${command}" is not correct.
    Please specify one from the list: ${list}.
  `);
};

const isPublicSchema = schema => schema === PUBLIC_SCHEMA;

const getFilesData = {
  [MIGRATIONS_TYPES.seed]: ({ seed, seedName, schema }) => ({
    file: seedName,
    folders: getMigratingDirs(schema).seeds,
    isSeed: seed === true,
  }),
  [MIGRATIONS_TYPES.migration]: ({ migrate, migrationName, schema }) => ({
    file: migrationName,
    folders: getMigratingDirs(schema).migrations,
    isMigration: migrate === true,
  }),
};

const checkFileName = async (options, type) => {
  const { command } = options;
  if (!MIGRATIONS_TYPES_KEYS.includes(type)) {
    return false;
  }

  const { isSeed, isMigration, folders, file } = getFilesData[type](options);
  if (!file || !(isSeed || isMigration)) {
    return false;
  }
  if (isMigration && !MIGRATION_FILE_COMMANDS.includes(command)) {
    return false;
  }

  const filesList = [];
  const dirs = Array.isArray(folders) ? folders : [folders];
  for (const dir of dirs) {
    // eslint-disable-next-line no-await-in-loop
    const files = await fs.readdir(dir);
    filesList.push(...files);
  }

  if (filesList.includes(file)) {
    return true;
  }
  throw new Error(`${type} "${file}" does not exist.`);
};

const timeStart = label => {
  if (DEBUG) {
    console.time(label);
  }
};

const timeEnd = label => {
  if (DEBUG) {
    console.timeEnd(label);
  }
};

const logStartMessage = schema => debugMigrations(`Starting migration of ${schema}.`);

const decorateResultMessage = message =>
  R.isEmpty(message) ? 'Not executed.' : R.toString(message);

const logResultMessage = (schema, migrations, seeds) => {
  const messages = [
    `Migration and seed results of ${schema}.`,
    `Migrations: ${decorateResultMessage(migrations)}.`,
    `Seeds: ${decorateResultMessage(seeds)}.`,
  ];
  debugMigrations(messages.join('\n'));
};

const logFinishMessage = (schema, data) => {
  const { processed, succeeded, failed, count } = data;
  const messages = [
    `Finished migration of ${schema}.`,
    `Processed: ${processed}/${count}.`,
    `Succeeded: ${succeeded}/${count}.`,
    `Failed: ${failed}/${count}.`,
  ];
  debugMigrations(messages.join('\n'));
};

const logErrorMessage = (schema, error) =>
  logger.error(`Migrations error of "${schema}" has been occurred: ${R.toString(error)}.`);

export {
  checkCommand,
  checkFileName,
  timeStart,
  timeEnd,
  logStartMessage,
  logResultMessage,
  logFinishMessage,
  logErrorMessage,
  isPublicSchema,
  getMigratingDirs,
  debugMigrations,
};
