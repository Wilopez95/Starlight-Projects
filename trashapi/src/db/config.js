import Client from 'knex/lib/dialects/postgres/index.js';
import pg from 'pg';
import R from 'ramda';
import snakeCase from 'lodash/fp/snakeCase.js';
import mapKeys from 'lodash/fp/mapKeys.js';
import camelCase from 'lodash/fp/camelCase.js';
import isEmpty from 'lodash/fp/isEmpty.js';

import { DB_CLIENT, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from '../config.js';
import { utcTimestampFrmt } from '../utils/format.js';

const { setTypeParser, builtins } = pg.types;
const dateTimeTypes = [builtins.DATE, builtins.TIME, builtins.TIMETZ];
const timestampTypes = [builtins.TIMESTAMP, builtins.TIMESTAMPTZ];

setTypeParser(builtins.INT8, parseInt);
for (const dateTimeType of dateTimeTypes) {
  setTypeParser(dateTimeType, R.identity);
}
for (const timestampType of timestampTypes) {
  setTypeParser(timestampType, utcTimestampFrmt);
}

const knexConfig = {
  client: DB_CLIENT,
  connection: {
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    database: DB_NAME,
    password: DB_PASSWORD,
    multipleStatements: true,
    timezone: 'UTC',
  },
  pool: { min: 0, max: 20 },
  acquireConnectionTimeout: 10000,
  asyncStackTraces: true,
  wrapIdentifier: value => (value === '*' ? value : snakeCase(value)),
  postProcessResponse: response => {
    const result = Array.isArray(response)
      ? response.map(mapKeys(camelCase))
      : mapKeys(camelCase)(response);

    return isEmpty(result) ? null : result;
  },
};

Client.prototype.wrapIdentifier = knexConfig.wrapIdentifier;

export default knexConfig;
