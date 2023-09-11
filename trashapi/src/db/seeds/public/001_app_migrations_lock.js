import { APP_MIGRATIONS_LOCK, PUBLIC_SCHEMA } from '../../consts.js';

const item = {
  index: 1,
  isLocked: false,
};

export const seed = async knex => {
  const isExist = await knex(APP_MIGRATIONS_LOCK)
    .withSchema(PUBLIC_SCHEMA)
    .select('*')
    .where('index', item.index)
    .first();

  if (isExist) {
    return;
  }

  await knex(APP_MIGRATIONS_LOCK).withSchema(PUBLIC_SCHEMA).insert(item);
};
