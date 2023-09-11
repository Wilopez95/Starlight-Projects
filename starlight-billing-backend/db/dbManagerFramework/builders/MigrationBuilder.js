import TableBuilder from './TableBuilder.js';
import { MIGRATION_TASK_TYPE, TABLE_BUILDER_KIND } from './enums.js';

class MigrationBuilder {
  constructor(knex, logger) {
    this.knex = knex;
    this.logger = logger;
    this.tasks = [];
  }

  then(resolve, reject) {
    return this.tasks
      .reduce((prevOp, nextOp) => prevOp.then(nextOp.perform), Promise.resolve())
      .then(() => {
        this.tasks = [];
        resolve();
      })
      .catch(reject);
  }

  createOrAlterTable(opKind, schema, tableName, buildTable) {
    const tableBuilder = new TableBuilder(this.knex, schema, tableName, this.logger, opKind);

    this.tasks.push({
      type:
        opKind === TABLE_BUILDER_KIND.create
          ? MIGRATION_TASK_TYPE.createTable
          : MIGRATION_TASK_TYPE.alterTable,
      perform: () => {
        buildTable(tableBuilder);
        return tableBuilder.build();
      },
    });

    return this;
  }

  createTable(...args) {
    let schema;
    let tableName;
    let buildTable;

    if (args.length === 2) {
      [tableName, buildTable] = args;
    } else {
      [schema, tableName, buildTable] = args;
    }

    return this.createOrAlterTable(TABLE_BUILDER_KIND.create, schema, tableName, buildTable);
  }

  alterTable(...args) {
    let schema;
    let tableName;
    let buildTable;

    if (args.length === 2) {
      [tableName, buildTable] = args;
    } else {
      [schema, tableName, buildTable] = args;
    }

    return this.createOrAlterTable(TABLE_BUILDER_KIND.alter, schema, tableName, buildTable);
  }

  alterTables(...args) {
    let schema;
    let tableNames;
    let buildTable;

    if (args.length === 2) {
      [tableNames, buildTable] = args;
    } else {
      [schema, tableNames, buildTable] = args;
    }

    tableNames = Array.isArray(tableNames) ? tableNames : [tableNames];
    tableNames.forEach(tableName => {
      this.createOrAlterTable(TABLE_BUILDER_KIND.alter, schema, tableName, buildTable);
    });

    return this;
  }

  raw(statement, ...substitutions) {
    this.tasks.push({
      type: MIGRATION_TASK_TYPE.raw,
      perform: async () => {
        let result;
        try {
          result = await this.knex.schema.raw(statement, ...substitutions);
        } catch (error) {
          this.logger.error(
            `Aborting because of error at statement ${statement}
                                                with params ${substitutions}:
                            ${error}.
                        `,
          );

          // eslint-disable-next-line no-process-exit
          process.exit(1);
        }
        this.lastOperationResult = result;
      },
    });

    return this;
  }

  createType(typeName, fields) {
    this.dropType(typeName);
    this.raw(
      `
                create type ?? as (
                    ${fields.map(({ type }) => `?? ${type}`).join(', ')}
                )
            `,
      [typeName, ...fields.map(({ name }) => name)],
    );
    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.createType;

    return this;
  }

  createSchema(name) {
    this.raw('create schema if not exists ??', [name]);
    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.createSchema;

    return this;
  }

  createExtension(schema, name) {
    this.raw('create extension if not exists ?? with schema ??', [name, schema]);
    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.createExtension;

    return this;
  }

  createRemoteServer(remoteServerName, dataWrapper, options) {
    // Create server mapping
    const { host, database, port } = options;
    this.raw(
      `CREATE SERVER IF NOT EXISTS ${remoteServerName}
          FOREIGN DATA WRAPPER ${dataWrapper}
          OPTIONS (
            host '${host}',
            dbname '${database}',
            port '${port}'
          )`
    );
    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.createRemoteServer;

    return this;
  }

  createUserMapping(localUser, remoteServer, remoteUserConfig)
  {
    const { user, password } = remoteUserConfig;

    this.raw(`CREATE USER MAPPING IF NOT EXISTS FOR ${localUser} SERVER ${remoteServer} OPTIONS (user '${user}', password '${password}')`);

    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.createUserMapping;

    return this;
  }

  drop(name, objectType, cascade = false, type = MIGRATION_TASK_TYPE.drop) {
    this.raw(`drop ${objectType} if exists ??${cascade ? ' cascade' : ''}`, [name]);
    this.tasks[this.tasks.length - 1].type = type;

    return this;
  }

  dropExtension(name) {
    return this.drop(name, 'extension', true, MIGRATION_TASK_TYPE.dropExtension);
  }

  dropWithSchema(schema, name, objectType, cascade = false, type = MIGRATION_TASK_TYPE.drop) {
    this.raw(`drop ${objectType} if exists ??.??${cascade ? ' cascade' : ''}`, [schema, name]);
    this.tasks[this.tasks.length - 1].type = type;

    return this;
  }

  dropType(name, cascade = false) {
    return this.drop(name, 'type', cascade, MIGRATION_TASK_TYPE.dropType);
  }

  dropSchema(name, cascade = false) {
    return this.drop(name, 'schema', cascade, MIGRATION_TASK_TYPE.dropSchema);
  }

  dropTable(...args) {
    if (args.length === 2 && typeof args[1] === 'string') {
      const [schema, name] = args;

      return this.dropWithSchema(schema, name, 'table', false, MIGRATION_TASK_TYPE.dropTable);
    } else if (args.length === 1 || (args.length === 2 && typeof args[1] === 'boolean')) {
      const [name, cascade] = args;

      return this.drop(name, 'table', cascade, MIGRATION_TASK_TYPE.dropTable);
    }

    const [schema, name, cascade] = args;

    return this.dropWithSchema(schema, name, 'table', cascade, MIGRATION_TASK_TYPE.dropTable);
  }

  dropRemoteServer(server) {
    this.drop(server, 'server', false, MIGRATION_TASK_TYPE.dropRemoteServer);
  }

  dropUserMapping(user, serverName) {
    this.raw('DROP USER MAPPING IF EXISTS FOR ?? SERVER ??', [user, serverName]);
    this.tasks[this.tasks.length - 1].type = MIGRATION_TASK_TYPE.dropUserMapping;

    return this;
  }

}
export default MigrationBuilder;
