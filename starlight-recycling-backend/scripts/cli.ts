#!/usr/bin/env ts-node-script
import 'reflect-metadata';
import * as yargs from 'yargs';

import { TenantMigrationGenerateCommand } from './commands/TenantMigrationGenerateCommand';
import { EnsureSchemaExistsCommand } from './commands/EnsureSchemaExistsCommand';
import { TenantMigrationRunCommand } from './commands/TenantMigrationRunCommand';
import { TenantMigrationCreateCommand } from './commands/TenantMigrationCreateCommand';
import { TenantMigrationRevertCommand } from './commands/TenantMigrationRevertCommand';

yargs
  .usage('Usage: $0 <command> [options]')
  .command(new TenantMigrationGenerateCommand())
  .command(new TenantMigrationRunCommand())
  .command(new TenantMigrationCreateCommand())
  .command(new TenantMigrationRevertCommand())
  .command(new EnsureSchemaExistsCommand())
  .recommendCommands()
  .demandCommand(1)
  .strict()
  .alias('v', 'version')
  .help('h')
  .alias('h', 'help').argv;

require('yargonaut')
  .style('blue')
  .style('yellow', 'required')
  .helpStyle('green')
  .errorsStyle('red');
