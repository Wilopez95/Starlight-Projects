import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import isEmpty from 'lodash/isEmpty.js';

import dbManager from '../db/dbManagerFramework/dbManager.js';
import config from '../db/config.js';
import knex from '../db/connection.js';

import { logger } from '../utils/logger.js';

process.on('unhandledRejection', error => {
  logger.error(error);
  throw error;
});

yargs(hideBin(process.argv))
  .usage('Usage: yarn migrate <command> [options]')
  .command(
    'new [tenant] <name>',
    'Create migration file',
    y => {
      y.positional('name', {
        describe: 'migration name',
        type: 'string',
      })
        .boolean('tenant')
        .alias('t', 'tenant');
    },
    async argv => {
      await dbManager.migrate.createMigration(config, argv);

      await knex.destroy();
    },
  )
  .command(
    'up [count]',
    'Run the pending migration(s)',
    y => {
      y.positional('count', {
        describe: 'migrations count',
        type: 'number',
      });
    },
    async ({ count = 0 } = {}) => {
      await dbManager.migrate.up(knex, config, count);

      await knex.destroy();
    },
  )
  .command(
    'down [count]',
    'Revert the last migration(s)',
    y => {
      y.positional('count', {
        describe: 'migrations count',
        type: 'number',
      });
    },
    async ({ count = 0 } = {}) => {
      await dbManager.migrate.down(knex, config, count);

      await knex.destroy();
    },
  )
  .command('rollback', 'Revert all migrations', async () => {
    await dbManager.migrate.rollback(knex, config);

    await knex.destroy();
  })
  .command('list', 'List all applied migrations', async () => {
    const migrations = await dbManager.migrate.getAllApplied(knex, config);

    let printed = false;
    const getName = ({ name }) => name;

    if (!isEmpty(migrations)) {
      const { global } = migrations;
      if (!isEmpty(global)) {
        logger.info(`Global migrations:\n${global.map(getName).join('\n')}`);
        printed = true;
        delete migrations.global;
      }

      if (!isEmpty(migrations)) {
        logger.info('Tenant migrations:');
        Object.entries(migrations).forEach(([tenant, arr]) =>
          logger.info(`Tenant "${tenant}"\n${arr.map(getName).join('\n')}`),
        );
        printed = true;
      }
    }

    if (!printed) {
      logger.info('No applied migrations');
    }

    await knex.destroy();
  })
  .example('yarn migrate new createUsersTable', 'Create a global migration')
  .example('yarn migrate new --tenant createOrders', 'Create a tenant migration')
  .example('yarn migrate up', 'Run all pending migrations')
  .example('yarn migrate rollback', 'Revert all migrations')
  .demandCommand()
  .recommendCommands()
  .strict()
  .help('h')
  .alias('h', 'help').argv;
