import { ConnectionOptionsReader } from 'typeorm/connection/ConnectionOptionsReader';
import { Connection } from 'typeorm/connection/Connection';
import { createConnection } from 'typeorm';
import * as yargs from 'yargs';
import chalk from 'chalk';

/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-console: 0 */

/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */
export class EnsureSchemaExistsCommand implements yargs.CommandModule {
  command = 'migration:schemaExists';
  describe = 'Create schema if not exists';
  aliases = 'migration:schemaExists';

  builder(args: yargs.Argv): yargs.Argv<{}> {
    return args
      .option('c', {
        alias: 'connection',
        default: 'default',
        describe: 'Name of the connection on which run a query.',
      })
      .option('f', {
        alias: 'config',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  handler = async (args: yargs.Arguments): Promise<void> => {
    let directory = args.dir;

    // if directory is not set then try to open tsconfig and find default path there
    if (!directory) {
      try {
        const connectionOptionsReader = new ConnectionOptionsReader({
          root: process.cwd(),
          configName: args.config as any,
        });
        const connectionOptions = await connectionOptionsReader.get(args.connection as any);
        directory = connectionOptions.cli ? connectionOptions.cli.migrationsDir : undefined;
      } catch (err) {}
    }

    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = new ConnectionOptionsReader({
        root: process.cwd(),
        configName: args.config as any,
      });
      const connectionOptions = await connectionOptionsReader.get(args.connection as any);
      Object.assign(connectionOptions, {
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: true,
      });
      const schema: string = (connectionOptions as any).schema;
      connection = await createConnection(connectionOptions);

      const queryRunner = connection.createQueryRunner('master');
      const schemaEsists = await queryRunner.hasSchema(schema);

      if (!schemaEsists) {
        connection.logger.log('info', `Creatring schema ${schema}`);
        await queryRunner.createSchema(schema);
      } else {
        connection.logger.log('info', `Schema ${schema} exists`);
      }

      await connection.close();
    } catch (err) {
      if (connection) {
        await (connection as Connection).close();
      }

      console.log(chalk.black.bgRed('Error during checking schema:'));
      console.error(err);
      process.exit(1);
    }
  };
}
