import mapValues from 'lodash/fp/mapValues.js';
import mapKeys from 'lodash/fp/mapKeys.js';
import keyBy from 'lodash/fp/keyBy.js';
import groupBy from 'lodash/fp/groupBy.js';
import compose from 'lodash/fp/compose.js';
import merge from 'lodash/merge.js';

const defaultAdminSchema = 'admin';

// Snapshots are only generated during development
// where `starlight` schema is guaranteed to exist
const defaultDevTenant = 'starlight';

const mapColumnMetadata = ({ type, notnull, defaultValue, identity }) => {
  const mappedColumn = { type, isNullable: !notnull };

  if (defaultValue) {
    mappedColumn.defaultTo = defaultValue;
  }

  if (identity) {
    mappedColumn.isIdentity = true;
  }

  return mappedColumn;
};

const mapIndexMetadata = ({ definition }) => definition;
const mapConstraintMetadata = ({ definition }) => definition;

const mapTablesQueryResult = (metadataMapper, key) =>
  compose(
    mapKeys(k => (k === defaultDevTenant ? 'tenant' : k)),
    mapValues(mapValues(val => ({ [key]: val }))),
    mapValues(mapValues(mapValues(metadataMapper))),
    mapValues(mapValues(keyBy('name'))),
    mapValues(groupBy('relname')),
    groupBy('nspname'),
  );

const mapAttributes = mapTablesQueryResult(mapColumnMetadata, 'attributes');
const mapIndexes = mapTablesQueryResult(mapIndexMetadata, 'indexes');
const mapConstraints = mapTablesQueryResult(mapConstraintMetadata, 'constraints');

export const getAllTablesAndColumns = async knex => {
  let [columns, constraints, indexes] = await Promise.all([
    knex('pg_attribute as att')
      .select(
        'rel.relname',
        'nsp.nspname',
        'att.attname as name',
        'att.attnotnull as notnull',
        'att.attidentity as identity',
        'typ.typname as type',
        knex.raw('pg_get_expr(??, ??) as ??', ['ad.adbin', 'rel.oid', 'defaultValue']),
      )
      .innerJoin('pg_class as rel', 'att.attrelid', 'rel.oid')
      .innerJoin('pg_namespace as nsp', 'nsp.oid', 'rel.relnamespace')
      .innerJoin('pg_type as typ', 'typ.oid', 'att.atttypid')
      .leftJoin('pg_attrdef as ad', builder =>
        builder
          .on(knex.raw('?? is true', ['att.atthasdef']))
          .andOn('ad.adrelid', 'rel.oid')
          .andOn('ad.adnum', 'att.attnum'),
      )
      .whereIn('nsp.nspname', [defaultAdminSchema, defaultDevTenant])
      .andWhere('att.attnum', '>', 0)
      .andWhere('rel.relkind', 'r')
      .orderBy('att.attnum'),
    knex('pg_constraint as con')
      .select(
        'nspname',
        'contype',
        'conname as name',
        'relname',
        knex.raw('pg_get_constraintdef(??, ?) as ??', ['con.oid', 'true', 'definition']),
      )
      .innerJoin('pg_class as rel', 'rel.oid', 'con.conrelid')
      .innerJoin('pg_namespace as nsp', 'nsp.oid', 'rel.relnamespace')
      .whereIn('nsp.nspname', [defaultAdminSchema, defaultDevTenant])
      .orderBy('name'),
    knex('pg_index as ind')
      .select(
        'nspname',
        'indrel.relname as name',
        'rel.relname',
        knex.raw('pg_get_indexdef(??) as ??', ['ind.indexrelid', 'definition']),
      )
      .innerJoin('pg_class as rel', 'rel.oid', 'ind.indrelid')
      .innerJoin('pg_class as indrel', 'indrel.oid', 'ind.indexrelid')
      .innerJoin('pg_namespace as nsp', 'nsp.oid', 'rel.relnamespace')
      .whereIn('nspname', [defaultAdminSchema, defaultDevTenant])
      .andWhere('rel.relkind', 'r')
      .andWhere(
        'ind.indexrelid',
        'not in',
        knex('pg_constraint as con')
          .select('conindid')
          .innerJoin('pg_class as rel', 'conrelid', 'rel.oid')
          .innerJoin('pg_namespace as nsp', 'nsp.oid', 'rel.relnamespace')
          .whereIn('nsp.nspname', [defaultAdminSchema, defaultDevTenant]),
      )
      .orderBy('name'),
  ]);

  if (!columns) {
    columns = [];
  }

  if (!constraints) {
    constraints = [];
  }

  if (!indexes) {
    indexes = [];
  }

  return merge(mapAttributes(columns), mapIndexes(indexes), mapConstraints(constraints));
};
