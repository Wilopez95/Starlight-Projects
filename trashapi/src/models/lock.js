import knex from '../db/connection.js';
import { PUBLIC_SCHEMA, APP_MIGRATIONS_LOCK } from '../db/consts.js';

export const getLock = async () => {
  const tenantsLock = await knex(APP_MIGRATIONS_LOCK)
    .withSchema(PUBLIC_SCHEMA)
    .select('is_locked')
    .where('index', 1)
    .first();
  return tenantsLock.is_locked;
};

export const updateLock = async value => {
  const result = await knex(APP_MIGRATIONS_LOCK)
    .withSchema(PUBLIC_SCHEMA)
    .update({ isLocked: value })
    .where('index', 1)
    .returning('is_locked');
  return result[0];
};
