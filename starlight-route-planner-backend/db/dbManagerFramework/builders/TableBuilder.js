import MigrationError from '../MigrationError.js';
import ColumnBuilder from './ColumnBuilder.js';
import { TABLE_BUILDER_KIND, TABLE_TASK_TYPE, CONSTRAINT_KIND, COLUMN_TASK_TYPE } from './enums.js';

class TableBuilder {
  constructor(knex, schema, tableName, logger, kind = TABLE_BUILDER_KIND.create) {
    this.knex = knex;
    this.tableName = tableName;
    this.schema = schema;
    this.kind = kind;
    this.logger = logger;

    this.preSchemaTasks = [];
    this.tableTasks = [];
    this.schemaTasks = [];
  }

  async build() {
    const runTasksSequentially = tasks =>
      tasks
        .reduce((prevTask, nextTask) => prevTask.then(nextTask.perform), Promise.resolve())
        .catch(error => {
          const table = this.schema ? `${this.schema}.${this.tableName}` : this.tableName;
          this.logger.error(error, `Error at ${table}. Aborting...`);

          return Promise.reject(error);
        });

    // resolve prepend tasks like constraints drop
    if (this.preSchemaTasks.length) {
      await runTasksSequentially(this.preSchemaTasks);
    }

    const knexChain = this.schema ? this.knex.schema.withSchema(this.schema) : this.knex.schema;
    const knexSchemaMethod = this.kind === TABLE_BUILDER_KIND.create ? 'createTable' : 'table';

    try {
      await knexChain[knexSchemaMethod](this.tableName, t => {
        this.tableTasks.forEach(task => {
          task.perform(t);
        });
      });
    } catch (error) {
      const table = this.schema ? `${this.schema}.${this.tableName}` : this.tableName;
      this.logger.error(error, `Error at table ${table}`);
      throw error;
    }

    if (this.schemaTasks.length) {
      await runTasksSequentially(this.schemaTasks);
    }
  }

  timestamps() {
    this.tableTasks.push({
      type: TABLE_TASK_TYPE.addTimestamps,
      perform: t => {
        t.timestamp('created_at', { useTz: false }).defaultTo(this.knex.fn.now());
        t.timestamp('updated_at', { useTz: false }).defaultTo(this.knex.fn.now());
      },
    });
  }

  column(columnName) {
    const columnBuilder = new ColumnBuilder(this.knex, this, columnName);

    this.tableTasks.push({
      type: TABLE_TASK_TYPE.column,
      builder: columnBuilder,
      perform: t => {
        columnBuilder.build(t);
      },
    });

    return columnBuilder;
  }

  foreign(columnName, { column = 'id', table, schema, onDelete = 'restrict' } = {}) {
    this.tableTasks.push({
      type: TABLE_TASK_TYPE.addConstraint,
      kind: CONSTRAINT_KIND.foreignKey,
      perform: t => {
        t.foreign(columnName)
          .references(column)
          .inTable(schema ? `${schema}.${table}` : table)
          .onDelete(onDelete);
      },
    });
  }

  primary(columns) {
    this.tableTasks.push({
      type: TABLE_TASK_TYPE.addConstraint,
      kind: CONSTRAINT_KIND.primary,
      perform: t => {
        t.primary(columns);
      },
    });
  }

  unique(columnNames, { constraint = true, indexType = 'btree', indexName } = {}) {
    const columns = Array.isArray(columnNames) ? columnNames : [columnNames];

    if (constraint && indexType !== 'btree') {
      throw new MigrationError('Custom index types are not supported with table constraints');
    }

    if (constraint && columns.some(column => !/^([a-z_]+\.)?[a-z_]+$/.test(column))) {
      throw new MigrationError('Expressions are not supported in constraint indices');
    }

    if (constraint) {
      this.tableTasks.push({
        type: TABLE_TASK_TYPE.addConstraint,
        kind: CONSTRAINT_KIND.unique,
        perform: t => {
          t.unique(columns, indexName);
        },
      });
    } else {
      this.index(columns, { indexType, unique: true, indexName });
    }
  }

  index(
    expressions,
    { indexType = 'btree', unique = false, concurrently = false, predicate } = {},
  ) {
    const createClause = unique ? 'create unique index' : 'create index';
    const concurrentlyClause = concurrently ? ' concurrently' : '';
    const indexName = Array.from(expressions.join(',').matchAll(/[a-z_]+/g)).join('_');
    const whereClause = predicate ? `where ${predicate}` : '';
    const indexExpression = expressions
      .map(expr => (/^([a-z_]+\.)?[a-z_]+$/.test(expr) ? expr : `(${expr})`))
      .join(', ');

    this.schemaTasks.push({
      type: TABLE_TASK_TYPE.addIndex,
      indexType,
      perform: () =>
        this.knex.schema.raw(
          `${createClause}${concurrentlyClause} if not exists ?? on ??
                    using ${indexType} (
                        ${indexExpression}
                    ) ${whereClause}`,
          [`${indexName}_idx`, this.tableName],
        ),
    });
  }

  check(expression) {
    const perform = this.schema
      ? () =>
          this.knex.schema.raw(`alter table ??.?? add check (${expression})`, [
            this.schema,
            this.tableName,
          ])
      : () => this.knex.schema.raw(`alter table ?? add check (${expression})`, [this.tableName]);

    this.schemaTasks.push({
      type: TABLE_TASK_TYPE.addConstraint,
      kind: CONSTRAINT_KIND.check,
      perform,
    });
  }

  dropConstraint(constraint) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.dropConstraint,
      kind: CONSTRAINT_KIND.check,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`alter table ??.?? drop constraint if exists ??`, [
              this.schema,
              this.tableName,
              constraint,
            ])
          : this.knex.schema.raw(`alter table ?? drop constraint if exists ??`, [
              this.tableName,
              constraint,
            ]),
    });
  }

  dropNotNull(columnName) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.dropConstraint,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`alter table ??.?? alter column ?? drop not null`, [
              this.schema,
              this.tableName,
              columnName,
            ])
          : this.knex.schema.raw(`alter table ?? alter column ?? drop not null`, [
              this.tableName,
              columnName,
            ]),
    });
  }

  renameConstraint(oldConstraint, newConstraint) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.renameConstraint,
      kind: CONSTRAINT_KIND.check,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`alter table ??.?? rename constraint ?? to ??`, [
              this.schema,
              this.tableName,
              oldConstraint,
              newConstraint,
            ])
          : this.knex.schema.raw(`alter table ?? rename constraint ?? to ??`, [
              this.tableName,
              oldConstraint,
              newConstraint,
            ]),
    });
  }

  renameColumn(columnName, newColumnName) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.renameColumn,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`alter table ??.?? rename column ?? to ??`, [
              this.schema,
              this.tableName,
              columnName,
              newColumnName,
            ])
          : this.knex.schema.raw(`alter table ?? rename column ?? to ??`, [
              this.tableName,
              columnName,
              newColumnName,
            ]),
    });
  }

  dropColumn(columnName) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.dropColumn,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`alter table ??.?? drop column if exists ??`, [
              this.schema,
              this.tableName,
              columnName,
            ])
          : this.knex.schema.raw(`alter table ?? drop column if exists ??`, [
              this.tableName,
              columnName,
            ]),
    });
  }

  dropIndex(indexName) {
    this.preSchemaTasks.push({
      type: TABLE_TASK_TYPE.dropIndex,
      perform: () =>
        this.schema
          ? this.knex.schema.raw(`drop index if exists ??.??`, [this.schema, indexName])
          : this.knex.schema.raw(`drop index if exists ??`, [indexName]),
    });
  }

  addHistoricalTable() {
    this.schemaTasks.push({
      type: TABLE_TASK_TYPE.addHistoricalTable,
      perform: async () => {
        const historicalTableBuilder = new TableBuilder(
          this.knex,
          this.schema,
          `${this.tableName}_historical`,
        );

        historicalTableBuilder.column('id').integer().identity();
        historicalTableBuilder.column('event_type').text();
        historicalTableBuilder.column('original_id').integer().notNullable();
        historicalTableBuilder.timestamps();

        historicalTableBuilder.tableTasks = historicalTableBuilder.tableTasks.concat(
          this.tableTasks
            .filter(
              task => task.type === TABLE_TASK_TYPE.column && task.builder.columnName !== 'id',
            )
            .map(columnTask => {
              const newBuilder = new ColumnBuilder(
                this.knex,
                historicalTableBuilder,
                columnTask.builder.columnName,
              );

              newBuilder.tasks = columnTask.builder.tasks.filter(
                task =>
                  task.type === COLUMN_TASK_TYPE.columnType ||
                  task.type === COLUMN_TASK_TYPE.generatedColumn,
              );

              return {
                type: TABLE_TASK_TYPE.column,
                builder: newBuilder,
                perform: t => {
                  newBuilder.build(t);
                },
              };
            }),
        );

        await historicalTableBuilder.build();
      },
    });
  }

  addAddressFields(prefix) {
    this.column(prefix ? `${prefix}_address_line_1` : 'address_line_1')
      .text()
      .notNullable();
    this.column(prefix ? `${prefix}_address_line_2` : 'address_line_2').text();
    this.column(prefix ? `${prefix}_city` : 'city')
      .text()
      .notNullable();
    this.column(prefix ? `${prefix}_state` : 'state')
      .text()
      .notNullable();
    this.column(prefix ? `${prefix}_zip` : 'zip')
      .text()
      .notNullable();
  }
}

export default TableBuilder;
