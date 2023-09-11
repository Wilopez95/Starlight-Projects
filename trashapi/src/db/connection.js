import knex from 'knex';

import knexConfig from './config.js';

const connection = knex(knexConfig);

export default connection;
