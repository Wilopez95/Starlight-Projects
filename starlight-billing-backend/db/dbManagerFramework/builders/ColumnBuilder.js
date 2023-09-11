import MigrationError from '../MigrationError.js';

import { COLUMN_TYPE, COLUMN_TASK_TYPE, IDENTITY_KIND } from './enums.js';

class ColumnBuilder {
  constructor(knex, tableBuilder, columnName) {
    this.knex = knex;
    this.tableBuilder = tableBuilder;
    this.columnName = columnName;

    this.isAlter = false;
    this.tasks = [];
  }

  build(tableChain) {
    if (this.isAlter) {
      this.tasks.push({
        type: COLUMN_TASK_TYPE.alterColumn,
        op: 'alter',
      });
    }

    if (!this.hasSpecifiedType() && this.tasks.length > 0) {
      // eslint-disable-next-line no-useless-concat
      throw new MigrationError(
        'You must specify a column type first! ' +
          `At column ${this.tableBuilder.tableName}.${this.columnName}`,
      );
    }

    this.tasks.reduce(
      (chain, nextTask) => chain[nextTask.op](...(nextTask.args || [])),
      tableChain,
    );
  }

  hasSpecifiedType() {
    const firstTask = this.tasks[0] && this.tasks[0].type;

    return (
      firstTask &&
      (firstTask === COLUMN_TASK_TYPE.columnType ||
        firstTask === COLUMN_TASK_TYPE.identityColumn ||
        firstTask === COLUMN_TASK_TYPE.generatedColumn)
    );
  }

  alter() {
    this.isAlter = true;
  }

  notNullable() {
    this.tasks.push({
      type: COLUMN_TASK_TYPE.notNullable,
      op: 'notNullable',
    });

    return this;
  }

  defaultTo(expression) {
    this.tasks.push({
      type: COLUMN_TASK_TYPE.defaultTo,
      op: 'defaultTo',
      args: [expression],
    });

    return this;
  }

  in(...values) {
    let possibleValues = values;

    if (Array.isArray(possibleValues[0]) && possibleValues.length === 1) {
      [possibleValues] = possibleValues;
    }

    this.tableBuilder.check(
      `${this.columnName} in (${possibleValues.map(value => `'${value}'`).join(', ')})`,
    );

    return this;
  }

  check(expression) {
    this.tableBuilder.check(`${this.columnName} ${expression}`);

    return this;
  }

  identity(kind = IDENTITY_KIND.byDefault) {
    const index = this.tasks.findIndex(task => task.type === COLUMN_TASK_TYPE.columnType);

    if (index === -1) {
      throw new MigrationError(
        `\`identity\` can only come after a method defining the column type in the chain
                    for column ${this.columnName} in ${this.tableBuilder.tableName}`,
      );
    }

    // since knex TableBuilder `specificType` is used under the hood,
    // `args` is basically [columnName, columnType]
    const [, columnType] = this.tasks[index].args;

    if (columnType !== COLUMN_TYPE.bigInteger && columnType !== COLUMN_TYPE.integer) {
      throw new MigrationError('Only columns of type INTEGER or BIGINT can be identity columns');
    }

    const identityClause = kind === IDENTITY_KIND.byDefault ? 'by default' : 'always';

    this.tasks.splice(index, 1, {
      type: COLUMN_TASK_TYPE.identityColumn,
      op: 'specificType',
      args: [this.columnName, `${columnType} generated ${identityClause} as identity`],
    });

    this.tableBuilder.primary([this.columnName]);

    return this;
  }

  primary() {
    this.tableBuilder.primary([this.columnName]);

    return this;
  }

  generated(expression) {
    const index = this.tasks.findIndex(task => task.type === COLUMN_TASK_TYPE.columnType);
    const columnType = this.tasks[index].args && this.tasks[index].args[1];

    if (!columnType) {
      throw new MigrationError(
        `Invalid columnType task at ${this.tableBuilder.taleName}.${this.columnName}`,
      );
    }

    this.tasks.splice(index, 1, {
      type: COLUMN_TASK_TYPE.generatedColumn,
      op: 'specificType',
      args: [this.columnName, `${columnType} generated always as (${expression}) stored`],
    });

    return this;
  }

  unique() {
    this.tableBuilder.unique([this.columnName], {
      constraint: true,
    });

    return this;
  }

  type(type) {
    this.tasks.push({
      type: COLUMN_TASK_TYPE.columnType,
      op: 'specificType',
      args: [this.columnName, type],
    });

    return this;
  }

  integer() {
    return this.type('integer');
  }

  bigint() {
    return this.type('bigint');
  }

  numeric() {
    return this.type('numeric');
  }

  text() {
    return this.type('text');
  }

  date() {
    return this.type('date');
  }

  timetz() {
    return this.type('time with time zone');
  }

  timestamp() {
    return this.type('timestamp');
  }

  timestamptz() {
    return this.type('timestamp with time zone');
  }

  boolean() {
    return this.type('boolean');
  }

  pointGeography() {
    return this.type('public.geography(point)');
  }

  jsonb() {
    return this.type('jsonb');
  }

  uuid() {
    return this.type('uuid');
  }

  arrayOf(type, length = '') {
    const dimensions = Array.isArray(length)
      ? length.map(dim => `[${dim}]`).join('')
      : `[${length}]`;

    return this.type(`${type}${dimensions}`);
  }

  references(config) {
    if (!config) {
      throw new MigrationError('Foreign key config must be a string or an object with key table');
    }

    const fkConfig = typeof config === 'object' ? config : { table: config };

    this.tableBuilder.foreign(this.columnName, fkConfig);

    return this;
  }
}

export default ColumnBuilder;
