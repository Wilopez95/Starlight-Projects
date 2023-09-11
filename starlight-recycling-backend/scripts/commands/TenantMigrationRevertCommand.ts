import { createConnection, MigrationExecutor } from 'typeorm';
import { ConnectionOptionsReader } from 'typeorm/connection/ConnectionOptionsReader';
import { Connection } from 'typeorm/connection/Connection';
import * as process from 'process';
import * as yargs from 'yargs';
import * as chalk from 'chalk';

/**
 * Reverts last migration command.
 */
export class TenantMigrationRevertCommand implements yargs.CommandModule {
  command = 'migration:tenant:revert';
  describe = 'Reverts last executed migration for a tenant.';
  aliases = 'migrations:tenant:revert';

  builder(args: yargs.Argv): yargs.Argv<{}> {
    return args
      .option('c', {
        alias: 'connection',
        default: 'default',
        describe: 'Name of the connection on which run a query.',
      })
      .option('transaction', {
        alias: 't',
        default: 'default',
        describe:
          'Indicates if transaction should be used or not for migration revert. Enabled by default.',
      })
      .option('f', {
        alias: 'config',
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
        // noop
      }

      const queryRunner = connection.createQueryRunner('master');

      const migrationExecutor = new MigrationExecutor(connection, queryRunner);
      migrationExecutor.transaction = options.transaction;

      await migrationExecutor.undoLastMigration();

      await connection.close();
    } catch (err) {
      if (connection) {
        await (connection as Connection).close();
      }

      console.log(chalk.black.bgRed('Error during migration revert:'));
      console.error(err);
      process.exit(1);
    }
  };
}
