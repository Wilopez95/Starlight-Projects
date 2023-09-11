export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions  
     add column type text,
     add column service_date date,
     add column period_since date,
     add column period_to date,
     add column service_name text,
     add column price numeric,
     add column quantity numeric,
     add column total_price numeric`,

    [schemaName],
  );
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions  
    add column type text,
    add column service_date date,
    add column period_since date,
    add column period_to date,
    add column service_name text,
    add column price numeric,
    add column quantity numeric,
    add column total_price numeric`,
    [schemaName],
  );
};
