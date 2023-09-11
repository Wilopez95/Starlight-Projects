/* eslint-disable import/no-extraneous-dependencies */

import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

import dbManager from '../db/dbManagerFramework/dbManager.js';
import config from '../db/dbConfig.js';

import { logger } from '../utils/logger.js';

process.on('unhandledRejection', error => {
  logger.error(error.message);
  throw error;
});

yargs(hideBin(process.argv))
  .usage('Usage: yarn seed <command> [options]')
  .command(
    'new <name>',
    'Create seed file',
    y => {
      y.positional('name', {
        describe: 'migration name',
        type: 'string',
      });
    },
    async argv => {
      await dbManager.createSeed(config, argv);
      await dbManager.knex.destroy();
    },
  )
  .command('run', 'Run all seeds', async () => {
    await dbManager.runSeeds(config);
    await dbManager.knex.destroy();
  })
  .example('yarn seed new defaultUsers', 'Create a new seed file migration')
  .example('yarn seed run', 'Run all seeds')
  .demandCommand()
  .recommendCommands()
  .strict()
  .help('h')
  .alias('h', 'help').argv;
