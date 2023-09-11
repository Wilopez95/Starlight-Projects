export const up = async knex => {
  await knex.schema.alterTable('companies', t => {
    t.text('unit').nullable();
  });
};

export const down = async knex => {
  await knex.schema.alterTable('companies', table => {
    table.dropColumn('unit');
  });
};
