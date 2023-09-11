export const up = async knex => {
  await knex.schema.alterTable('tenants', table => {
    table.dropUnique('legal_name');
  });
};

export const down = async knex => {
  // do nothing to avoid duplicates error
};
