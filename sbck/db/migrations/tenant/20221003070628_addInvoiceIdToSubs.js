export const up = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions   add column invoiceId text`,
    [schemaName],
  );
};

export const down = async (migrationBuilder, schemaName) => {
  await migrationBuilder.knex.raw(
    `ALTER TABLE if exists ??.subscriptions   add column invoiceId text`,
    [schemaName],
  );
};
