export const MIGRATION_TASK_TYPE = {
  createTable: 'createTable',
  alterTable: 'alterTable',
  createType: 'createType',
  createExtension: 'createExtension',
  raw: 'raw',
  drop: 'drop',
  dropTable: 'dropTable',
  dropSchema: 'dropSchema',
  dropType: 'dropType',
  dropExtension: 'dropExtension',
};

export const COLUMN_TASK_TYPE = {
  columnType: 'columnType',
  identityColumn: 'identityColumn',
  generatedColumn: 'generatedColumn',
  notNullable: 'notNullable',
  defaultTo: 'defaultTo',
  alterColumn: 'alterColumn',
};

export const IDENTITY_KIND = {
  always: 'always',
  byDefault: 'byDefault',
};

export const COLUMN_TYPE = {
  integer: 'integer',
  bigInteger: 'bigInteger',
  text: 'text',
  boolean: 'boolean',
};

export const TABLE_BUILDER_KIND = {
  alter: 'alter',
  create: 'create',
};

export const TABLE_TASK_TYPE = {
  addTimestamps: 'addTimestamps',
  column: 'column',
  addConstraint: 'addConstraint',
  addIndex: 'addIndex',
  addHistoricalTable: 'addHistoricalTable',
  dropColumn: 'dropColumn',
  dropConstraint: 'dropConstraint',
  renameConstraint: 'renameConstraint',
  renameColumn: 'renameColumn',
};

export const CONSTRAINT_KIND = {
  unique: 'unique',
  check: 'check',
  foreignKey: 'foreignKey',
};
