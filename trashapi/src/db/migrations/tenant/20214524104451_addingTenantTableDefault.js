export const up = async (knex) => {
  await knex.raw(`
    insert into tenantTable(tenant_name) values (DEFAULT);
  `);
};
  

export const down = async knex => {
  // do nothing to avoid duplicates error
};
