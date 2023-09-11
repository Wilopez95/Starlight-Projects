#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import migrateSchemas from '../src/db/migrateSchemas.js';
import migrateDatabase from '../src/db/migrateDatabase.js';
import { createSeed, createMigration } from '../src/db/create.js';
import { MIGRATION_COMMANDS } from '../src/db/consts.js';

const {
  UP,
  DOWN,
  ROLLBACK,
  LATEST,
  UNLOCK,
} = Object.keys(MIGRATION_COMMANDS).reduce((acc, key) => {
  acc[key] = key.toLowerCase();
  return acc;
}, {});

const defaultOptions = (yargs) =>
  yargs
    .option('schema', {
      alias: ['database', 'd', 's'],
      describe: 'Specify the schema if you want run for single schema',
      type: 'string',
    })
    .option('create', {
      alias: 'c',
      describe: 'Specify if you want to create schema',
      type: 'boolean',
    })
    .option('remove', {
      alias: 'r',
      describe: 'Specify if you want to create schema',
      type: 'boolean',
    })
    .option('test', {
      alias: 't',
      describe: 'Specify if you want to make changes for test schema',
      type: 'boolean',
    });

yargs(hideBin(process.argv))
  .usage('NODE_ENV=development [migrate | seed] [command] [options]')
  .example('NODE_ENV=development yarn migrate [command] [options]')
  .command('migrate', 'Run migrations', (yargs) => yargs
    .example('NODE_ENV=development yarn migrate latest [options]')
    .command(
      'latest',
      'Run all migrations and seeds',
      (yargs) => {
        defaultOptions(yargs)
          .option('all', {
            alias: 'a',
            describe: 'Specify if you want to run all migrations for tenants and admin schemas',
            type: 'boolean',
          });
      },
      async ({
        schema = null,
        create = false,
        test = false,
        all = false,
      }) => {
        const options = {
          migrate: true,
          seed: true,
          command: LATEST.toLowerCase(),
          schema,
          create,
          remove: false,
          test,
        };
        if (all) {
          await migrateDatabase();
        } else {
          await migrateSchemas(options);
        }
      },
    )
    .example('NODE_ENV=development yarn migrate rollback [options]')
    .command(
      'rollback',
      'Rollback all migrations with --all flag or last batch',
      (yargs) => {
        defaultOptions(yargs)
          .option('all', {
            alias: 'a',
            describe: 'Specify if you want to rollback all migrations',
            type: 'boolean',
          });
      },
      async ({
        all = false,
        schema = null,
        remove = false,
        test = false,
      }) => {
        const options = {
          migrate: true,
          seed: false,
          command: ROLLBACK.toLowerCase(),
          all,
          schema,
          remove,
          test,
        };
        await migrateSchemas(options);
      },
    )
    .example('NODE_ENV=development yarn migrate up [fileName] [options]')
    .command(
      'up [fileName]',
      'Run specified [fileName] migration or the next chronological migration that has not yet be run',
      (yargs) => {
        defaultOptions(yargs)
          .positional('fileName', {
            describe: 'migration name',
            type: 'string',
          });
      },
      async ({
        fileName = null,
        schema = null,
        create = false,
        test = false,
      }) => {
        const options = {
          migrate: true,
          seed: false,
          command: UP.toLowerCase(),
          migrationName: fileName,
          schema,
          create,
          test,
        };
        await migrateSchemas(options);
      },
    )
    .example('NODE_ENV=development yarn migrate down [fileName] [options]')
    .command(
      'down [fileName]',
      'Undo the specified [fileName] migration or the last migration that was run.',
      (yargs) => {
        defaultOptions(yargs)
          .positional('fileName', {
            describe: 'migration name',
            type: 'string',
          });
      },
      async ({
        fileName = null,
        schema = null,
        create = false,
        test = false,
      }) => {
        const options = {
          migrate: true,
          seed: false,
          command: DOWN.toLowerCase(),
          migrationName: fileName,
          schema,
          create,
          remove: false,
          test,
        };
        await migrateSchemas(options);
      },
    )
    .example('NODE_ENV=development yarn migrate unlock [options]')
    .command(
      'unlock',
      'Forcibly unlocks the migrations lock table, and ensures that there is only one row in it.',
      defaultOptions,
      async ({
       schema = null,
       test = false,
      }) => {
        const options = {
          migrate: true,
          seed: false,
          command: UNLOCK.toLowerCase(),
          schema,
          create: false,
          remove: false,
          test,
        };
        await migrateSchemas(options);
      },
    )
    .example('yarn migrate make [fileName] [options]')
    .command(
      'make [fileName]',
      'Create migration by specific [fileName]',
      (yargs) =>
        yargs
          .option('schema', {
            alias: ['database', 'd', 's'],
            describe: 'Specify the schema or will be created for tenants',
            type: 'string',
          })
          .positional('fileName', {
            describe: 'migration name',
            type: 'string',
          }),
      async ({ schema = null, fileName }) => {
        await createMigration({ schema, fileName });
      },
    )
  )
  .example('NODE_ENV=development yarn seed [command] [fileName] [options]')
  .command('seed', 'Seed commands', (yargs) => yargs
    .example('NODE_ENV=development yarn seed run [options]')
    .command(
      'run [fileName]',
      'Run seeds all or by specific [fileName]',
      (yargs) =>
        yargs
          .option('schema', {
            alias: ['database', 'd', 's'],
            describe: 'Specify the schema if you want run for single schema',
            type: 'string',
          })
          .positional('fileName', {
            describe: 'migration name',
            type: 'string',
          }),
      async ({
        fileName = null,
        schema = null,
        test = false,
      }) => {
        const options = {
          migrate: false,
          seed: true,
          command: LATEST.toLowerCase(),
          seedName: fileName,
          schema,
          create: false,
          remove: false,
          test,
        };
        await migrateSchemas(options);
      },
    )
    .example('yarn seed make [fileName] [options]')
    .command(
      'make [fileName]',
      'Create seed by specific [fileName]',
      (yargs) =>
        yargs
          .option('schema', {
            alias: ['database', 'd', 's'],
            describe: 'Specify the schema or will be created for tenants',
            type: 'string',
          })
          .positional('fileName', {
            describe: 'migration name',
            type: 'string',
          }),
      async ({ schema = null, fileName }) => {
        await createSeed({ schema, fileName });
      },
    )
  )
  .demandCommand()
  .recommendCommands()
  .strict()
  .help('h')
  .alias('h', 'help').argv;
