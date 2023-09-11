export const up = async (migrationBuilder, schema) => {
  const query = `ALTER TABLE if exists ${schema}.business_units alter column tenant_name SET DEFAULT '${schema}';`;
  await migrationBuilder.knex.raw(query);
};

export const down = async () => {};
