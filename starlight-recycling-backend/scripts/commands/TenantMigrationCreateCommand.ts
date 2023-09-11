import { ConnectionOptionsReader } from 'typeorm/connection/ConnectionOptionsReader';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { camelCase } from 'typeorm/util/StringUtils';
import * as yargs from 'yargs';
import chalk from 'chalk';

/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-console: 0 */

/**
 * Creates a new migration file.
 */
export class TenantMigrationCreateCommand implements yargs.CommandModule {
  command = 'migration:tenant:create';
  describe = 'Creates a new migration file for tenant.';
  aliases = 'migration:tenant:create';

  builder(args: yargs.Argv): yargs.Argv<{}> {
    return args
      .option('c', {
        alias: 'connection',
        default: 'default',
        describe: 'Name of the connection on which run a query.',
      })
      .option('n', {
        alias: 'name',
        describe: 'Name of the migration class.',
        demand: true,
      })
      .option('d', {
        alias: 'dir',
        describe: 'Directory where migration should be created.',
      })
      .option('f', {
        alias: 'config',
        default: 'ormconfig',
        describe: 'Name of the file with connection configuration.',
      });
  }

  async handler(args: yargs.Arguments): Promise<string | undefined> {
    try {
      const timestamp = new Date().getTime();
      const fileContent = TenantMigrationCreateCommand.getTemplate(args.name as any, timestamp);
      const filename = timestamp + '-' + args.name + '.ts';
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

      const path = process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
      await CommandUtils.createFile(path, fileContent);

      console.log(`Migration ${chalk.blue(path)} has been generated successfully.`);

      return path;
    } catch (err) {
      console.log(chalk.black.bgRed('Error during migration creation:'));
      console.error(err);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------------------
  // Protected Static Methods
  // -------------------------------------------------------------------------

  /**
   * Gets contents of the migration file.
   */
  protected static getTemplate(name: string, timestamp: number): string {
    const migrationName = `${camelCase(name, true)}${timestamp}`;

    return `import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${migrationName} implements MigrationInterface {
    name = '${migrationName}'

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        \`SET LOCAL search_path TO '\${(queryRunner.connection.options as any).schema}',public,postgis\`,
        [],
      );

      // here will go your code for "up"

      await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        \`SET LOCAL search_path TO '\${(queryRunner.connection.options as any).schema}',public,postgis\`,
        [],
      );

      // here will go your code for "down"

      await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
    }

}
`;
  }
}
