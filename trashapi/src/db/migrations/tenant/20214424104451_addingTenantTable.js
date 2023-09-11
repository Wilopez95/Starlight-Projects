export const up = async (knex) => {
  await knex.raw(`
    create table tenantTable
    (
        id           bigserial
            primary key,
        tenant_name  varchar(255)  default current_schema() not null
    );
  `);
};
  

export const down = async knex => {
  // do nothing to avoid duplicates error
};
