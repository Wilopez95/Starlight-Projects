import { createConnection, MigrationExecutor } from 'typeorm';
import { ConnectionOptionsReader } from 'typeorm/connection/ConnectionOptionsReader';
import { Connection } from 'typeorm/connection/Connection';
import * as process from 'process';
import * as yargs from 'yargs';
import chalk from 'chalk';

/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-console: 0 */

/**
 * Runs migration command.
 */
export class TenantMigrationRunCommand implements yargs.CommandModule {
  command = 'migration:tenant:run';
  describe = 'Runs all pending migrations for a tenant.';
  aliases = 'migration:tenant:run';

  builder(args: yargs.Argv): yargs.Argv<{}> {
    return args
      .option('connection', {
        alias: 'c',
        default: 'default',
        describe: 'Name of the connection on which run a query.',
      })
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for migration run. Enabled by default.',
      })
      .option('config', {
        alias: 'f',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  handler = async (args: yargs.Arguments): Promise<void> => {
    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = new ConnectionOptionsReader({
        root: process.cwd(),
        configName: args.config as any,
      });
      const connectionOptions = await connectionOptionsReader.get(args.connection as any);
      Object.assign(connectionOptions, {
        subscribers: [],
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        migrationsTransactionMode: 'each',
        logging: ['query', 'error', 'schema'],
      });
      connection = await createConnection(connectionOptions);

      const options = {
        transaction: 'all' as 'all' | 'none' | 'each',
      };

      switch (args.t) {
        case 'all':
          options.transaction = 'all';
          break;
        case 'none':
        case 'false':
          options.transaction = 'none';
          break;
        case 'each':
          options.transaction = 'each';
          break;
        default:
          options.transaction = connection.options.migrationsTransactionMode || 'each';
        // noop
      }

      const queryRunner = connection.createQueryRunner('master');

      const migrationExecutor = new MigrationExecutor(connection, queryRunner);
      migrationExecutor.transaction = options.transaction;

      await migrationExecutor.executePendingMigrations();

      await connection.close();
      // exit process if no errors
      process.exit(0);
    } catch (err) {
      if (connection) {
        await (connection as Connection).close();
      }

      console.log(chalk.black.bgRed('Error during migration run:'));
      console.error(err);
      process.exit(1);
    }
  };
}
