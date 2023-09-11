export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions   add column invoice_id text`,
    [schemaName],
  );
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions   drop column invoice_id`,
    [schemaName],
  );
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions   add column invoice_id text`,
    [schemaName],
  );
};
