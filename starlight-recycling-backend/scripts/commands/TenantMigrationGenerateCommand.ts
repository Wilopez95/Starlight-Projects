import { ConnectionOptionsReader } from 'typeorm/connection/ConnectionOptionsReader';
import { ConnectionOptionsEnvReader } from 'typeorm/connection/options-reader/ConnectionOptionsEnvReader';
import { CommandUtils } from 'typeorm/commands/CommandUtils';
import { Connection } from 'typeorm/connection/Connection';
import { createConnection } from 'typeorm';
import { MysqlDriver } from 'typeorm/driver/mysql/MysqlDriver';
import { camelCase } from 'typeorm/util/StringUtils';
import * as yargs from 'yargs';
import { AuroraDataApiDriver } from 'typeorm/driver/aurora-data-api/AuroraDataApiDriver';
import chalk from 'chalk';

/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint no-console: 0 */

/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */
export class TenantMigrationGenerateCommand implements yargs.CommandModule {
  command = 'migration:tenant:generate';
  describe = 'Generates a new migration file with sql needs to be executed to update schema.';
  aliases = 'migration:tenant:generate';

  schema = 'todo-schema';

  builder(args: yargs.Argv): yargs.Argv<unknown> {
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

  private filterOutSchema(query: string): string {
    return query.replace(new RegExp(`"${this.schema}"\.`, 'g'), '');
  }

  private isQueryForCurrentSchema = (query: string): boolean => {
    return query.indexOf(`"${this.schema}".`) > -1;
  };

  handler = async (args: yargs.Arguments): Promise<void> => {
    if (args._[0] === 'migrations:generate') {
      console.log("'migrations:generate' is deprecated, please use 'migration:generate' instead");
    }

    const timestamp = new Date().getTime();
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

    let connection: Connection | undefined = undefined;
    try {
      const connectionOptionsReader = new ConnectionOptionsReader({
        root: process.cwd(),
        configName: args.config as any,
      });
      const connectionOptionsEnv = await new ConnectionOptionsEnvReader().read();
      const connectionOptions = await connectionOptionsReader.get(args.connection as any);
      let migrations = connectionOptions.migrations;
      const migrationsEnv = connectionOptionsEnv[0].migrations;

      if ((!migrations || migrations.length === 0) && migrationsEnv && migrationsEnv.length > 0) {
        migrations = migrationsEnv;
      }

      Object.assign(connectionOptions, {
        synchronize: false,
        migrationsRun: false,
        dropSchema: false,
        logging: true,
        migrations,
      });

      this.schema = (connectionOptions as any).schema;
      connection = await createConnection(connectionOptions);
      const sqlInMemory = await connection.driver.createSchemaBuilder().log();
      const upSqls: string[] = [],
        downSqls: string[] = [];

      // mysql is exceptional here because it uses ` character in to escape names in queries, that's why for mysql
      // we are using simple quoted string instead of template string syntax
      if (
        connection.driver instanceof MysqlDriver ||
        connection.driver instanceof AuroraDataApiDriver
      ) {
        sqlInMemory.upQueries.forEach((upQuery) => {
          // filter out central entities
          if (!this.isQueryForCurrentSchema(upQuery.query)) {
            return;
          }

          upSqls.push(
            'await queryRunner.query("' +
              this.filterOutSchema(upQuery.query).replace(new RegExp(`"`, 'g'), `\\"`) +
              '"' +
              TenantMigrationGenerateCommand.queryParams(upQuery.parameters) +
              ');',
          );
        });
        sqlInMemory.downQueries.forEach((downQuery) => {
          // filter out central entities
          if (!this.isQueryForCurrentSchema(downQuery.query)) {
            return;
          }

          downSqls.push(
            'await queryRunner.query("' +
              this.filterOutSchema(downQuery.query).replace(new RegExp(`"`, 'g'), `\\"`) +
              '"' +
              TenantMigrationGenerateCommand.queryParams(downQuery.parameters) +
              ');',
          );
        });
      } else {
        sqlInMemory.upQueries.forEach((upQuery) => {
          const queryWithoutSchema = this.filterOutSchema(upQuery.query);

          // filter out central entities and existing queries, until it is fixed in typeorm PostgresDriver
          if (!this.isQueryForCurrentSchema(upQuery.query)) {
            return;
          }

          upSqls.push(
            'await queryRunner.query(`' +
              queryWithoutSchema.replace(new RegExp('`', 'g'), '\\`') +
              '`' +
              TenantMigrationGenerateCommand.queryParams(upQuery.parameters) +
              ');',
          );
        });
        sqlInMemory.downQueries.forEach((downQuery) => {
          const queryWithoutSchema = this.filterOutSchema(downQuery.query);

          // filter out central entities and existing queries , until it is fixed in typeorm PostgresDriver
          if (!this.isQueryForCurrentSchema(downQuery.query)) {
            return;
          }

          downSqls.push(
            'await queryRunner.query(`' +
              queryWithoutSchema.replace(new RegExp('`', 'g'), '\\`') +
              '`' +
              TenantMigrationGenerateCommand.queryParams(downQuery.parameters) +
              ');',
          );
        });
      }

      if (upSqls.length) {
        if (args.name) {
          const fileContent = TenantMigrationGenerateCommand.getTemplate(
            args.name as any,
            timestamp,
            upSqls,
            downSqls.reverse(),
          );
          const path = process.cwd() + '/' + (directory ? directory + '/' : '') + filename;
          await CommandUtils.createFile(path, fileContent);

          console.log(
            chalk.green(`Migration ${chalk.blue(path)} has been generated successfully.`),
          );
        } else {
          console.log(chalk.yellow('Please specify migration name'));
        }
      } else {
        console.log(
          chalk.yellow(
            `No changes in database schema were found - cannot generate a migration. To create a new empty migration use "typeorm migration:create" command`,
          ),
        );
      }
      await connection.close();
    } catch (err) {
      if (connection) {
        await (connection as Connection).close();
      }

      console.log(chalk.black.bgRed('Error during migration generation:'));
      console.error(err);
      process.exit(1);
    }
  };

  // -------------------------------------------------------------------------
  // Protected Static Methods
  // -------------------------------------------------------------------------

  /**
   * Formats query parameters for migration queries if parameters actually exist
   */
  protected static queryParams(parameters: any[] | undefined): string {
    if (!parameters || !parameters.length) {
      return '';
    }

    return `, ${JSON.stringify(parameters)}`;
  }

  /**
   * Gets contents of the migration file.
   */
  protected static getTemplate(
    name: string,
    timestamp: number,
    upSqls: string[],
    downSqls: string[],
  ): string {
    const migrationName = `${camelCase(name, true)}${timestamp}`;

    return `import { MigrationInterface, QueryRunner } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export class ${migrationName} implements MigrationInterface {
  name = '${migrationName}'

  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(\`Running migration up: \${this.name}\`);
    await queryRunner.query(
      \`SET LOCAL search_path TO '\${
        (queryRunner.connection.options as PostgresConnectionOptions).schema
      }',public,postgis\`,
      [],
    );

    ${upSqls.join('\n    ')}

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.connection.logger.logMigration(\`Running migration down: \${this.name}\`);
    await queryRunner.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      \`SET LOCAL search_path TO '\${(queryRunner.connection.options as any).schema}',public,postgis\`,
      [],
    );

    ${downSqls.join('\n    ')}

    await queryRunner.query('SET LOCAL search_path TO public,postgis', []);
  }

}
`;
  }
}
