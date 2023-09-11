export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants add column public_api_key text`,
    [schemaName],
  );
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.merchants drop column public_api_key;`,
    [schemaName],
  );
};
