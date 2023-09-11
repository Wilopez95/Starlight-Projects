import { resolve } from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { logger } from '../utils/logger.js';
import { chmodSync } from './chmod.js';

process.on('unhandledRejection', error => {
  logger.error(error.message);
  throw error;
});

yargs(hideBin(process.argv))
  .usage('Usage: yarn mp <command> [options...]')
  .command(
    'chmod <mode> [path]',
    'multi-platform chmod',
    argsBuilder =>
      argsBuilder
        .positional('mode', {
          describe: 'file system access level',
          type: 'string',
        })
        .positional('path', {
          describe: 'file system path',
          type: 'string',
        }),
    ({ path, mode }) => {
      chmodSync(resolve(process.cwd(), path), mode);
    },
  )
  .example('yarn mp chmod +x ./scripts/custom.sh', 'Make script executable on your machine')
  .demandCommand()
  .recommendCommands()
  .strict()
  .help('h')
  .alias('h', 'help').argv;
