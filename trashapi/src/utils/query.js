/* eslint-disable no-shadow */
import R from 'ramda';
import sql from 'node-sql-2';
import _debug from 'debug';

import logger from '../services/logger/index.js';
import { IS_TEST_CI_DB_ENV } from '../db/consts.js';
import knex from '../db/connection.js';

const debug = _debug('api:utils:query');

const toQueryPairs = R.pipe(
  R.map(R.invoker(0, 'toQuery')),
  R.map(({ text, values }) => [text.replace(/\$\d+/g, '?'), values?.map(value => value ?? null)]),
);
const toQueryParts = R.pipe(R.of, toQueryPairs, R.head);

const transaction = async (sql, user) => {
  let trx;
  try {
    trx = await knex.transaction();
    await trx.raw(`SET search_path TO "${user.tenantName}"`);
    const result = R.is(Function, sql)
      ? await sql(async query => {
          const queryParts = toQueryParts(query);
          const res = await trx.raw(...queryParts);
          return res?.rows || res;
        })
      : await R.reduce(
          (prev, params) => prev.then(() => trx.raw(...params)),
          Promise.resolve(),
          toQueryPairs(sql),
        );
    await trx.commit();
    return result?.rows || result;
  } catch (error) {
    if (trx) {
      await trx.rollback();
    }

    throw error;
  }
};

export const my = async (queries, user) => {
  if (!R.is(Function, queries) && !R.is(Array, queries)) {
    // eslint-disable-next-line no-param-reassign
    queries = R.of(queries);
  }

  try {
    const result = await transaction(queries, user);
    return result;
  } catch (error) {
    if (!IS_TEST_CI_DB_ENV) {
      logger.error(`Database error: ${error}`);
    }
    throw error;
  }
};

export const one = R.compose(R.head, my);

export const l = x => `%${x}%`;

export const json = sql.functionCallCreator('JSONB_EXTRACT_PATH_TEXT');

export const sqlLength = sql.functionCallCreator('LENGTH');

export const cast = (value, type) =>
  value && type ? knex.raw(`CAST('${value}' AS ${type})`) : value;

export const buildQueryObj = queryStr => {
  debug('queryStr: \n', queryStr);
  return {
    toQuery: () => ({ text: queryStr, values: [] }),
  };
};
