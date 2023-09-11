export const up = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.business_units drop column tenant_name;`,
    [schema],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.business_units add column tenant_name text not null  default '${schema}';`,
    [schema],
  );
};

export const down = async (migrationBuilder, schema) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.business_units drop column tenant_name;`,
    [schema],
  );
};
