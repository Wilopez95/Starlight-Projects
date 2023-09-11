export const up = async knex => {
  await knex.schema.createTable('app_migrations_lock', (table) => {
    table.increments('index').primary();

    table
      .boolean('is_locked')
      .defaultTo(false)
      .notNullable();
  });
};

export const down = async knex => {
  await knex.schema.dropTableIfExists('app_migrations_lock');
};
