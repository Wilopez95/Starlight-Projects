import mapKeys from 'lodash/fp/mapKeys.js';

export const unambiguousCondition = (tableName, condition) =>
  typeof condition == 'function'
    ? condition
    : mapKeys(key => (key.includes('.') ? key : `${tableName}.${key}`))(condition);

export const unambiguousSelect = (tableName, fields) =>
  fields.map(field => (field.includes('.') ? field : `${tableName}.${field}`));
