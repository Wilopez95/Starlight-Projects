/* eslint-disable */
const { resolve } = require('path');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');

const { chmodSync } = require('./chmod');

process.on('unhandledRejection', (error) => {
  console.error(error.message);
  throw error;
});

yargs(hideBin(process.argv))
  .usage('Usage: yarn mp <command> [options...]')
  .command(
    'chmod <mode> [path]',
    'multi-platform chmod',
    (argsBuilder) =>
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
