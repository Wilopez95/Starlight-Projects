import sql from 'node-sql-2';
import snakeCase from 'lodash/fp/snakeCase.js';

// set columns in camelCase, but in db in snake_keys
export default (name, columns) =>
  sql.define({
    name,
    columns: columns.map(column => ({
      name: snakeCase(column),
      property: column,
    })),
  });
