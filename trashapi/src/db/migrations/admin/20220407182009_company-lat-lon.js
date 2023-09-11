
export const up = async knex => {
  await knex.schema.alterTable('companies', t => {
    t.double('physical_latitude').nullable();
    t.double('physical_longitude').nullable();
  });
};

export const down = async knex => {
  await knex.schema.alterTable('companies', table => {
    table.dropColumn('physical_latitude');
    table.dropColumn('physical_longitude');
  });
};
