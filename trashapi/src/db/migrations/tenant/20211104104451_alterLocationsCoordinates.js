export const up = async knex => {
  await knex.schema.alterTable('locations', t => {
    t.double('latitude').alter();
    t.double('longitude').alter();
  });
};

export const down = async knex => {
  // do nothing to avoid duplicates error
};
